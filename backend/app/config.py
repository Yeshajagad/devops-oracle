import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
REPO_DIR = os.path.join(os.path.dirname(__file__), "repos")
CHROMA_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(REPO_DIR, exist_ok=True)
os.makedirs(CHROMA_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {
    ".py", ".js", ".jsx", ".ts", ".tsx", ".html", ".css",
    ".md", ".txt", ".json", ".yaml", ".yml", ".toml",
    ".env.example", ".sh", ".dockerfile", ".tf", ".go",
    ".java", ".rs", ".cpp", ".c", ".h", ".rb", ".php"
}

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 150
MAX_RETRIEVAL_DOCS = 6
EMBED_MODEL = "all-MiniLM-L6-v2"
LLM_MODEL = "llama-3.3-70b-versatile"