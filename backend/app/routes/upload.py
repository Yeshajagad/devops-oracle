import os
import uuid
import zipfile
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.services.github_loader import clone_github_repo, load_files_from_path, cleanup_repo
from app.services.parser import parse_files_to_documents
from app.services.chunker import chunk_documents
from app.services.vectorstore import store_documents
from app.config import UPLOAD_DIR

router = APIRouter()


class GithubURLRequest(BaseModel):
    github_url: str


@router.post("/upload-repo")
async def upload_github_repo(request: GithubURLRequest):
    """Clone and index a GitHub repository."""
    url = request.github_url.strip()
    if not url.startswith("https://github.com/"):
        raise HTTPException(status_code=400, detail="Please provide a valid GitHub URL")

    try:
        repo_info = clone_github_repo(url)
        files = load_files_from_path(repo_info["local_path"])

        if not files:
            cleanup_repo(repo_info["local_path"])
            raise HTTPException(status_code=400, detail="No readable source files found in repository")

        documents = parse_files_to_documents(files, repo_info["repo_name"])
        chunks = chunk_documents(documents)
        collection = store_documents(
            chunks,
            repo_info["repo_id"],
            repo_info["repo_name"],
            source="github",
            url=url,
        )
        cleanup_repo(repo_info["local_path"])

        return {
            "success": True,
            "repo_id": repo_info["repo_id"],
            "repo_name": repo_info["repo_name"],
            "files_indexed": len(files),
            "chunks_created": len(chunks),
            "collection": collection,
            "message": f"Successfully indexed {len(files)} files from {repo_info['repo_name']}"
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Indexing failed: {str(e)}")


@router.post("/upload-zip")
async def upload_zip(file: UploadFile = File(...)):
    """Upload and index a ZIP project archive."""
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only .zip files are supported")

    repo_id = str(uuid.uuid4())[:8]
    repo_name = file.filename.replace(".zip", "")
    zip_path = os.path.join(UPLOAD_DIR, f"{repo_id}.zip")
    extract_path = os.path.join(UPLOAD_DIR, f"{repo_id}_extracted")

    try:
        with open(zip_path, "wb") as f:
            content = await file.read()
            f.write(content)

        with zipfile.ZipFile(zip_path, "r") as zf:
            zf.extractall(extract_path)

        files = load_files_from_path(extract_path)

        if not files:
            raise HTTPException(status_code=400, detail="No readable source files found in ZIP")

        documents = parse_files_to_documents(files, repo_name)
        chunks = chunk_documents(documents)
        collection = store_documents(chunks, repo_id, repo_name, source="zip")

        return {
            "success": True,
            "repo_id": repo_id,
            "repo_name": repo_name,
            "files_indexed": len(files),
            "chunks_created": len(chunks),
            "collection": collection,
            "message": f"Successfully indexed {len(files)} files from {repo_name}"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    finally:
        if os.path.exists(zip_path):
            os.remove(zip_path)
        if os.path.exists(extract_path):
            shutil.rmtree(extract_path, ignore_errors=True)