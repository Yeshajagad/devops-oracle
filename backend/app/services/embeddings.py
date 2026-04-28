from langchain_community.embeddings import HuggingFaceEmbeddings
from app.config import EMBED_MODEL

_embeddings_instance = None


def get_embeddings():
    """Return a cached embedding model instance."""
    global _embeddings_instance
    if _embeddings_instance is None:
        _embeddings_instance = HuggingFaceEmbeddings(
            model_name=EMBED_MODEL,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
    return _embeddings_instance