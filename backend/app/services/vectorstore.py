import os
import json
from langchain_community.vectorstores import Chroma
from langchain.schema import Document
from app.services.embeddings import get_embeddings
from app.config import CHROMA_DIR

REGISTRY_FILE = os.path.join(CHROMA_DIR, "registry.json")


def _load_registry() -> dict:
    if os.path.exists(REGISTRY_FILE):
        with open(REGISTRY_FILE, "r") as f:
            return json.load(f)
    return {}


def _save_registry(registry: dict):
    os.makedirs(CHROMA_DIR, exist_ok=True)
    with open(REGISTRY_FILE, "w") as f:
        json.dump(registry, f, indent=2)


def store_documents(chunks: list[Document], repo_id: str, repo_name: str, source: str, url: str = "") -> str:
    """Embed and store document chunks in ChromaDB."""
    collection_name = f"repo_{repo_id}"
    persist_dir = os.path.join(CHROMA_DIR, collection_name)

    embeddings = get_embeddings()
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name=collection_name,
        persist_directory=persist_dir,
    )
    vectorstore.persist()

    registry = _load_registry()
    registry[repo_id] = {
        "repo_id": repo_id,
        "repo_name": repo_name,
        "source": source,
        "url": url,
        "collection_name": collection_name,
        "persist_dir": persist_dir,
        "chunk_count": len(chunks),
    }
    _save_registry(registry)

    return collection_name


def get_vectorstore(repo_id: str) -> Chroma | None:
    """Load an existing vectorstore by repo_id."""
    registry = _load_registry()
    if repo_id not in registry:
        return None

    info = registry[repo_id]
    embeddings = get_embeddings()

    return Chroma(
        collection_name=info["collection_name"],
        embedding_function=embeddings,
        persist_directory=info["persist_dir"],
    )


def list_repos() -> list[dict]:
    """Return all indexed repos."""
    registry = _load_registry()
    return list(registry.values())


def delete_repo(repo_id: str) -> bool:
    """Delete a repo's vectorstore and registry entry."""
    import shutil
    registry = _load_registry()
    if repo_id not in registry:
        return False

    info = registry[repo_id]
    persist_dir = info.get("persist_dir", "")
    if os.path.exists(persist_dir):
        shutil.rmtree(persist_dir, ignore_errors=True)

    del registry[repo_id]
    _save_registry(registry)
    return True