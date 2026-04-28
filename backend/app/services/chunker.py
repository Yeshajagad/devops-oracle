from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from app.config import CHUNK_SIZE, CHUNK_OVERLAP


def chunk_documents(documents: list[Document]) -> list[Document]:
    """Split documents into chunks using recursive character splitting."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", "def ", "class ", "function ", "{", "}", " ", ""],
        length_function=len,
    )

    chunked = splitter.split_documents(documents)

    for i, chunk in enumerate(chunked):
        chunk.metadata["chunk_id"] = i

    return chunked