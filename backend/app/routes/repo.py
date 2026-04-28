from fastapi import APIRouter, HTTPException
from app.services.vectorstore import list_repos, delete_repo

router = APIRouter()


@router.get("/repos")
def get_repos():
    """List all indexed repositories."""
    repos = list_repos()
    return {"repos": repos, "count": len(repos)}


@router.delete("/repo/{repo_id}")
def remove_repo(repo_id: str):
    """Delete a repository and its vector index."""
    success = delete_repo(repo_id)
    if not success:
        raise HTTPException(status_code=404, detail="Repository not found")
    return {"success": True, "message": f"Repository {repo_id} deleted"}