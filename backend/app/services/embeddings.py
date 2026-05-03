from langchain_community.embeddings import HuggingFaceInferenceAPIEmbeddings
from langchain_groq import ChatGroq
import os

_embeddings_instance = None

def get_embeddings():
    global _embeddings_instance
    if _embeddings_instance is None:
        from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
        _embeddings_instance = FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")
    return _embeddings_instance