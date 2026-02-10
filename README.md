# ResearchHub - Document Research Intelligence Platform

A full-stack web application that enables users to upload PDF documents and interact with them using AI-powered chat. Built with React, FastAPI, MongoDB, and Google Gemini AI.

![ResearchHub](https://img.shields.io/badge/Status-Production%20Ready-success)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110.1-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-brightgreen)

## 🌟 Features

### 📄 Document Management
- **PDF Upload & Processing**: Upload PDF documents with automatic text extraction
- **Metadata Tagging**: Organize documents by company, industry, and custom categories
- **Smart Search**: Full-text search across all uploaded documents
- **Document Library**: Browse and manage your document collection

### 🤖 AI-Powered Chat
- **Intelligent Q&A**: Ask questions about your documents using Google Gemini AI
- **Context-Aware Responses**: Get accurate answers based on document content
- **Chat History**: View and track all conversations per document
- **Multi-Document Support**: Analyze multiple documents independently

### 📊 Analytics & Insights
- **Usage Statistics**: Track total documents, pages, and queries
- **Company & Industry Tracking**: Monitor research across different sectors
- **Recent Activity**: View your latest uploads and interactions
- **Visual Dashboard**: Clean, modern interface for data visualization

### 🔐 Security
- **JWT Authentication**: Secure user authentication and authorization
- **Password Encryption**: Bcrypt-based password hashing
- **User Isolation**: Each user's data is completely isolated
- **Secure File Storage**: Safe PDF storage with access control

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 14+** and **npm**
- **MongoDB** (running locally or remote)
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/sandeepnaikg/fullstack-assignment-money-stories.git
cd fullstack-assignment-money-stories
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
# Edit backend/.env and add your Gemini API key:
# GEMINI_API_KEY=your_actual_api_key_here

# Start MongoDB (if not already running)
brew services start mongodb-community  # macOS
# or
sudo systemctl start mongod  # Linux

# Run the backend server
python3 -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: **http://localhost:8000**

#### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install --legacy-peer-deps

# Install ajv if needed
npm install ajv@^8.0.0 --legacy-peer-deps

# Start the development server
npm start
```

Frontend will be available at: **http://localhost:3000**

## 🔧 Configuration

### Backend Environment Variables (`backend/.env`)

```bash
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_key_change_in_production
```

### Frontend Environment Variables (`frontend/.env`)

```bash
REACT_APP_BACKEND_URL=http://localhost:8000
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

## 📁 Project Structure

```
fullstack-assignment-money-stories/
├── backend/
│   ├── server.py              # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables
│   └── uploads/               # Uploaded PDF storage
├── frontend/
│   ├── src/
│   │   ├── pages/            # React pages
│   │   ├── components/       # Reusable components
│   │   └── App.js            # Main app component
│   ├── public/
│   │   └── index.html        # HTML template
│   ├── package.json          # Node dependencies
│   └── .env                  # Frontend environment
├── README.md                 # This file
└── RUN_INSTRUCTIONS.md       # Detailed setup guide
```

## 🛠️ Technology Stack

### Frontend
- **React 19.0.0** - UI framework
- **React Router** - Client-side routing
- **Radix UI** - Accessible component primitives
- **Material-UI** - Additional UI components
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Lenis** - Smooth scrolling

### Backend
- **FastAPI** - Modern Python web framework
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **Google Generative AI** - AI-powered document analysis
- **PyJWT** - JWT authentication
- **Bcrypt** - Password hashing
- **PDFPlumber** - PDF text extraction
- **Uvicorn** - ASGI server

### Database
- **MongoDB** - NoSQL document database

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Documents
- `POST /api/documents/upload` - Upload PDF document
- `GET /api/documents` - List user's documents
- `GET /api/documents/{id}` - Get specific document
- `POST /api/documents/search` - Search documents
- `DELETE /api/documents/{id}` - Delete document

### AI Chat
- `POST /api/chat/ask` - Ask question about document
- `GET /api/chat/{document_id}` - Get chat history

### Analytics
- `GET /api/analytics/stats` - Get usage statistics
- `GET /api/analytics/recent` - Get recent activity

## 🎯 Usage

1. **Register/Login**: Create an account or sign in
2. **Upload Documents**: Upload PDF files with optional metadata
3. **Browse Library**: View and search your document collection
4. **Ask Questions**: Click on a document and start asking questions
5. **View Analytics**: Check your usage statistics and insights

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
brew services list  # macOS
sudo systemctl status mongod  # Linux

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod  # Linux
```

### Port Already in Use
```bash
# Kill process on port 8000 (backend)
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Yarn vs NPM Conflict
If you have Hadoop installed, `yarn` command might conflict. Always use `npm` instead:
```bash
npm install --legacy-peer-deps
npm start
```

### Frontend Not Updating
If changes to `public/index.html` don't reflect:
```bash
# Stop the server (Ctrl+C) and restart
npm start
```

## 🔐 Security Notes

⚠️ **Important**: Before deploying to production:

1. Change `JWT_SECRET` to a strong, random value
2. Use environment-specific `.env` files
3. Enable HTTPS/SSL
4. Restrict CORS origins to your domain
5. Set up proper MongoDB authentication
6. Use a production-grade server (not `--reload`)
7. Implement rate limiting
8. Add input validation and sanitization

## 📝 License

This project is part of a fullstack assignment.

## 👤 Author

**Sandeep Naik**
- GitHub: [@sandeepnaikg](https://github.com/sandeepnaikg)

## 🙏 Acknowledgments

- Google Gemini AI for document analysis
- FastAPI for the excellent Python framework
- React team for the amazing frontend library
- MongoDB for the flexible database solution

## 📞 Support

For issues and questions:
1. Check the [RUN_INSTRUCTIONS.md](./RUN_INSTRUCTIONS.md) file
2. Review the troubleshooting section above
3. Check MongoDB and server logs
4. Verify API key configuration

---

**Built with ❤️ using React, FastAPI, and MongoDB**
