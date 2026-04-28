# DevOps Oracle

AI-powered codebase intelligence assistant. Upload a GitHub repo or ZIP, ask questions in natural language, get project-aware answers.

## Tech Stack
- **Backend**: FastAPI, LangChain, ChromaDB, SentenceTransformers, Groq + Llama 3
- **Frontend**: React + Vite + Tailwind CSS

## Quick Start

### Backend
```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deployment
- Backend → Render
- Frontend → Vercel
