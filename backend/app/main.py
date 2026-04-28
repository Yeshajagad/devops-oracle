import os
import sys
import traceback
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="DevOps Oracle API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import_error = None
try:
    from app.routes import upload, chat, repo
    app.include_router(upload.router, prefix="/api", tags=["Upload"])
    app.include_router(chat.router,   prefix="/api", tags=["Chat"])
    app.include_router(repo.router,   prefix="/api", tags=["Repos"])
except Exception as e:
    import_error = traceback.format_exc()
    print(f"IMPORT ERROR:\n{import_error}", file=sys.stderr)

@app.get("/")
def root():
    if import_error:
        return {"status": "degraded", "error": import_error}
    return {"status": "DevOps Oracle is running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}