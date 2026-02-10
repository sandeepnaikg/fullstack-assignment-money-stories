# Money Stories - Document Research Platform

## 🎉 Application Status: RUNNING ✅

Both the **backend** and **frontend** are now running successfully!

---

## 🌐 Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## 📋 Quick Start Commands

### Backend Server
```bash
cd /Users/sandeepnaik/Desktop/prac/fullstack-assignment-money-stories/backend
python3 -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Server
```bash
cd /Users/sandeepnaik/Desktop/prac/fullstack-assignment-money-stories/frontend
npm start
```

---

## 🔧 Fixes Applied

### 1. **Removed Proprietary Package**
- Removed `emergentintegrations==0.1.0` from `requirements.txt`
- Replaced with official `google-generativeai` package

### 2. **Updated Backend Code**
- Modified `server.py` to use Google's official Generative AI SDK
- Changed environment variable from `EMERGENT_LLM_KEY` to `GEMINI_API_KEY`
- Updated chat endpoint to use Gemini API directly

### 3. **Fixed Frontend Configuration**
- Changed backend URL from remote to `http://localhost:8000`
- Used `npm` instead of `yarn` (Hadoop conflict)
- Installed with `--legacy-peer-deps` to resolve dependency conflicts
- Fixed `ajv` module issue

---

## ⚙️ Environment Setup

### Backend `.env` Configuration
Located at: `/Users/sandeepnaik/Desktop/prac/fullstack-assignment-money-stories/backend/.env`

```bash
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE  # ⚠️ UPDATE THIS!
JWT_SECRET=research_platform_secret_key_change_in_production
```

### Frontend `.env` Configuration
Located at: `/Users/sandeepnaik/Desktop/prac/fullstack-assignment-money-stories/frontend/.env`

```bash
REACT_APP_BACKEND_URL=http://localhost:8000
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

---

## 🔑 Important: Get Your Gemini API Key

The AI chat feature requires a Google Gemini API key. To get one:

1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and update `backend/.env`:
   ```bash
   GEMINI_API_KEY=your_actual_api_key_here
   ```

---

## 📦 Installation Steps (If Starting Fresh)

### Prerequisites
```bash
# Install MongoDB (if not installed)
brew install mongodb-community
brew services start mongodb-community

# Verify installations
python3 --version  # Should be 3.8+
node --version     # Should be 14+
npm --version
```

### Backend Setup
```bash
cd backend

# Install Python dependencies
python3 -m pip install -r requirements.txt

# Run the server
python3 -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend

# Install Node dependencies (use npm, not yarn due to Hadoop conflict)
npm install --legacy-peer-deps

# Install ajv if needed
npm install ajv@^8.0.0 --legacy-peer-deps

# Run the development server
npm start
```

---

## 🏗️ Application Features

### Authentication
- User registration and login
- JWT-based authentication
- Secure password hashing with bcrypt

### Document Management
- Upload PDF documents
- Extract text and metadata
- Search and filter documents
- Tag with company and industry

### AI Chat
- Ask questions about uploaded documents
- Powered by Google Gemini AI
- Chat history saved per document

### Analytics
- View document statistics
- Track companies and industries
- Recent activity monitoring

---

## 🐛 Known Issues & Warnings

### Backend Warning (Non-Critical)
```
FutureWarning: All support for the `google.generativeai` package has ended.
Please switch to the `google.genai` package as soon as possible.
```
**Impact**: The app still works, but consider migrating to `google.genai` in the future.

### Frontend Warnings (Non-Critical)
- ESLint warnings about React Hook dependencies
- Some deprecated npm packages
- 18 security vulnerabilities (mostly in dev dependencies)

**Impact**: These don't affect functionality but should be addressed for production.

---

## 🛠️ Troubleshooting

### MongoDB Not Running
```bash
brew services start mongodb-community
```

### Port Already in Use
```bash
# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Yarn Command Conflicts with Hadoop
Always use `npm` instead of `yarn` on this system.

---

## 📁 Project Structure

```
fullstack-assignment-money-stories/
├── backend/
│   ├── server.py           # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   ├── .env               # Environment variables
│   └── uploads/           # Uploaded PDF files
├── frontend/
│   ├── src/               # React source code
│   ├── public/            # Static files
│   ├── package.json       # Node dependencies
│   └── .env              # Frontend environment
└── RUN_INSTRUCTIONS.md    # This file
```

---

## 🎯 Next Steps

1. **Update Gemini API Key** in `backend/.env`
2. **Test the application** by:
   - Creating an account at http://localhost:3000
   - Uploading a PDF document
   - Asking questions about the document
3. **Review and fix** ESLint warnings if needed
4. **Run security audit**: `npm audit fix` in frontend directory

---

## 📞 Support

If you encounter any issues:
1. Check that MongoDB is running
2. Verify both servers are running without errors
3. Check the browser console for frontend errors
4. Check terminal output for backend errors
5. Ensure the Gemini API key is valid

---

**Happy Coding! 🚀**
