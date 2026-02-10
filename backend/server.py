from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import pdfplumber
import shutil
from emergentintegrations.llm.chat import LlmChat, UserMessage, FileContentWithMimeType

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'default_secret_key')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# File storage
UPLOAD_DIR = ROOT_DIR / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Document(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    filename: str
    file_path: str
    company: Optional[str] = None
    industry: Optional[str] = None
    file_size: int
    page_count: int
    upload_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    text_content: Optional[str] = None
    status: str = 'processing'  # processing, ready, failed

class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str
    user_id: str
    role: str  # user or assistant
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QuestionRequest(BaseModel):
    document_id: str
    question: str

class SearchRequest(BaseModel):
    query: str
    company: Optional[str] = None
    industry: Optional[str] = None

# Auth helpers
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {'user_id': user_id, 'exp': expiration}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('user_id')
        if not user_id:
            raise HTTPException(status_code=401, detail='Invalid token')
        user = await db.users.find_one({'id': user_id}, {'_id': 0, 'password_hash': 0})
        if not user:
            raise HTTPException(status_code=401, detail='User not found')
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Token expired')
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail='Invalid token')

# Auth routes
@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    # Check if user exists
    existing = await db.users.find_one({'email': user_data.email}, {'_id': 0})
    if existing:
        raise HTTPException(status_code=400, detail='Email already registered')
    
    # Create user
    user = User(email=user_data.email, name=user_data.name)
    doc = user.model_dump()
    doc['password_hash'] = hash_password(user_data.password)
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    token = create_token(user.id)
    
    return {'token': token, 'user': user.model_dump()}

@api_router.post("/auth/login")
async def login(user_data: UserLogin):
    user_doc = await db.users.find_one({'email': user_data.email}, {'_id': 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    if not verify_password(user_data.password, user_doc['password_hash']):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    user = User(**{k: v for k, v in user_doc.items() if k != 'password_hash'})
    token = create_token(user.id)
    
    return {'token': token, 'user': user.model_dump()}

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Document routes
@api_router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    title: Optional[str] = None,
    company: Optional[str] = None,
    industry: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail='Only PDF files are supported')
    
    # Save file
    file_id = str(uuid.uuid4())
    file_ext = Path(file.filename).suffix
    filename = f"{file_id}{file_ext}"
    file_path = UPLOAD_DIR / filename
    
    with file_path.open('wb') as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Get file size
    file_size = file_path.stat().st_size
    
    # Extract text and count pages
    text_content = ''
    page_count = 0
    try:
        with pdfplumber.open(file_path) as pdf:
            page_count = len(pdf.pages)
            for page in pdf.pages[:50]:  # Limit to first 50 pages for performance
                text = page.extract_text()
                if text:
                    text_content += text + '\n\n'
    except Exception as e:
        logging.error(f"Error extracting PDF text: {e}")
    
    # Create document
    doc = Document(
        user_id=current_user.id,
        title=title or file.filename,
        filename=file.filename,
        file_path=str(file_path),
        company=company,
        industry=industry,
        file_size=file_size,
        page_count=page_count,
        text_content=text_content[:50000],  # Limit stored text
        status='ready' if text_content else 'failed'
    )
    
    doc_dict = doc.model_dump()
    doc_dict['upload_date'] = doc_dict['upload_date'].isoformat()
    
    await db.documents.insert_one(doc_dict)
    
    return doc.model_dump()

@api_router.get("/documents", response_model=List[Document])
async def get_documents(
    company: Optional[str] = None,
    industry: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    query = {'user_id': current_user.id}
    if company:
        query['company'] = {'$regex': company, '$options': 'i'}
    if industry:
        query['industry'] = {'$regex': industry, '$options': 'i'}
    
    docs = await db.documents.find(query, {'_id': 0}).sort('upload_date', -1).to_list(100)
    
    for doc in docs:
        if isinstance(doc['upload_date'], str):
            doc['upload_date'] = datetime.fromisoformat(doc['upload_date'])
    
    return docs

@api_router.get("/documents/{document_id}", response_model=Document)
async def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user)
):
    doc = await db.documents.find_one({'id': document_id, 'user_id': current_user.id}, {'_id': 0})
    if not doc:
        raise HTTPException(status_code=404, detail='Document not found')
    
    if isinstance(doc['upload_date'], str):
        doc['upload_date'] = datetime.fromisoformat(doc['upload_date'])
    
    return Document(**doc)

@api_router.post("/documents/search")
async def search_documents(
    search: SearchRequest,
    current_user: User = Depends(get_current_user)
):
    query = {'user_id': current_user.id}
    
    if search.query:
        query['$or'] = [
            {'title': {'$regex': search.query, '$options': 'i'}},
            {'text_content': {'$regex': search.query, '$options': 'i'}}
        ]
    
    if search.company:
        query['company'] = {'$regex': search.company, '$options': 'i'}
    if search.industry:
        query['industry'] = {'$regex': search.industry, '$options': 'i'}
    
    docs = await db.documents.find(query, {'_id': 0}).sort('upload_date', -1).to_list(50)
    
    for doc in docs:
        if isinstance(doc['upload_date'], str):
            doc['upload_date'] = datetime.fromisoformat(doc['upload_date'])
    
    return docs

@api_router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user)
):
    doc = await db.documents.find_one({'id': document_id, 'user_id': current_user.id}, {'_id': 0})
    if not doc:
        raise HTTPException(status_code=404, detail='Document not found')
    
    # Delete file
    file_path = Path(doc['file_path'])
    if file_path.exists():
        file_path.unlink()
    
    # Delete from database
    await db.documents.delete_one({'id': document_id})
    await db.chats.delete_many({'document_id': document_id})
    
    return {'message': 'Document deleted successfully'}

# AI Chat routes
@api_router.post("/chat/ask")
async def ask_question(
    request: QuestionRequest,
    current_user: User = Depends(get_current_user)
):
    # Get document
    doc = await db.documents.find_one({'id': request.document_id, 'user_id': current_user.id}, {'_id': 0})
    if not doc:
        raise HTTPException(status_code=404, detail='Document not found')
    
    # Initialize LLM chat
    api_key = os.environ.get('EMERGENT_LLM_KEY', '')
    if not api_key:
        raise HTTPException(status_code=500, detail='LLM API key not configured')
    
    chat = LlmChat(
        api_key=api_key,
        session_id=f"doc_{request.document_id}_{current_user.id}",
        system_message=f"You are a research assistant analyzing documents. The document title is '{doc['title']}'. Provide accurate, detailed answers based on the document content."
    ).with_model("gemini", "gemini-2.5-flash")
    
    # Create file attachment
    file_content = FileContentWithMimeType(
        file_path=doc['file_path'],
        mime_type='application/pdf'
    )
    
    # Save user message
    user_msg = ChatMessage(
        document_id=request.document_id,
        user_id=current_user.id,
        role='user',
        content=request.question
    )
    user_msg_dict = user_msg.model_dump()
    user_msg_dict['timestamp'] = user_msg_dict['timestamp'].isoformat()
    await db.chats.insert_one(user_msg_dict)
    
    # Get response from LLM
    try:
        user_message = UserMessage(
            text=request.question,
            file_contents=[file_content]
        )
        response = await chat.send_message(user_message)
        
        # Save assistant message
        assistant_msg = ChatMessage(
            document_id=request.document_id,
            user_id=current_user.id,
            role='assistant',
            content=response
        )
        assistant_msg_dict = assistant_msg.model_dump()
        assistant_msg_dict['timestamp'] = assistant_msg_dict['timestamp'].isoformat()
        await db.chats.insert_one(assistant_msg_dict)
        
        return {'answer': response}
    except Exception as e:
        logging.error(f"Error calling LLM: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")

@api_router.get("/chat/{document_id}", response_model=List[ChatMessage])
async def get_chat_history(
    document_id: str,
    current_user: User = Depends(get_current_user)
):
    # Verify document access
    doc = await db.documents.find_one({'id': document_id, 'user_id': current_user.id}, {'_id': 0})
    if not doc:
        raise HTTPException(status_code=404, detail='Document not found')
    
    messages = await db.chats.find(
        {'document_id': document_id, 'user_id': current_user.id},
        {'_id': 0}
    ).sort('timestamp', 1).to_list(100)
    
    for msg in messages:
        if isinstance(msg['timestamp'], str):
            msg['timestamp'] = datetime.fromisoformat(msg['timestamp'])
    
    return messages

# Analytics routes
@api_router.get("/analytics/stats")
async def get_stats(current_user: User = Depends(get_current_user)):
    total_docs = await db.documents.count_documents({'user_id': current_user.id})
    total_pages = await db.documents.aggregate([
        {'$match': {'user_id': current_user.id}},
        {'$group': {'_id': None, 'total': {'$sum': '$page_count'}}}
    ]).to_list(1)
    
    companies = await db.documents.distinct('company', {'user_id': current_user.id, 'company': {'$ne': None}})
    industries = await db.documents.distinct('industry', {'user_id': current_user.id, 'industry': {'$ne': None}})
    
    total_chats = await db.chats.count_documents({'user_id': current_user.id})
    
    return {
        'total_documents': total_docs,
        'total_pages': total_pages[0]['total'] if total_pages else 0,
        'total_companies': len(companies),
        'total_industries': len(industries),
        'total_queries': total_chats // 2,  # Divide by 2 (user + assistant messages)
        'companies': companies[:10],
        'industries': industries[:10]
    }

@api_router.get("/analytics/recent")
async def get_recent_activity(current_user: User = Depends(get_current_user)):
    recent_docs = await db.documents.find(
        {'user_id': current_user.id},
        {'_id': 0, 'title': 1, 'upload_date': 1, 'page_count': 1, 'company': 1}
    ).sort('upload_date', -1).limit(5).to_list(5)
    
    for doc in recent_docs:
        if isinstance(doc['upload_date'], str):
            doc['upload_date'] = datetime.fromisoformat(doc['upload_date'])
    
    return {'recent_documents': recent_docs}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
