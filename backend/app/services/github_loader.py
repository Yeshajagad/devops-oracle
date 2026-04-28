import os
import shutil
import uuid
import git
from app.config import REPO_DIR, ALLOWED_EXTENSIONS


def clone_github_repo(github_url: str) -> dict:
    """Clone a GitHub repository and return metadata."""
    repo_id = str(uuid.uuid4())[:8]
    repo_name = github_url.rstrip("/").split("/")[-1].replace(".git", "")
    local_path = os.path.join(REPO_DIR, f"{repo_id}_{repo_name}")

    try:
        git.Repo.clone_from(github_url, local_path, depth=1)
    except Exception as e:
        raise ValueError(f"Failed to clone repository: {str(e)}")

    return {
        "repo_id": repo_id,
        "repo_name": repo_name,
        "local_path": local_path,
        "source": "github",
        "url": github_url
    }


def load_files_from_path(directory: str) -> list[dict]:
    """Walk a directory and load all allowed file types."""
    files = []
    skip_dirs = {
        ".git", "node_modules", "__pycache__", ".venv", "venv",
        "dist", "build", ".next", ".nuxt", "coverage", ".pytest_cache"
    }

    for root, dirs, filenames in os.walk(directory):
        dirs[:] = [d for d in dirs if d not in skip_dirs]

        for filename in filenames:
            ext = os.path.splitext(filename)[1].lower()
            if ext not in ALLOWED_EXTENSIONS and filename not in {
                "Dockerfile", "Procfile", "Makefile", ".env.example"
            }:
                continue

            filepath = os.path.join(root, filename)
            relative_path = os.path.relpath(filepath, directory)

            try:
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()

                if not content.strip():
                    continue

                if len(content) > 100_000:
                    content = content[:100_000] + "\n... [truncated]"

                files.append({
                    "filename": filename,
                    "relative_path": relative_path,
                    "content": content,
                    "extension": ext
                })
            except Exception:
                continue

    return files


def cleanup_repo(local_path: str):
    """Remove a cloned repository from disk."""
    if os.path.exists(local_path):
        shutil.rmtree(local_path, ignore_errors=True)