from langchain_core.documents import Document
from app.services.vectorstore import get_vectorstore
from app.config import MAX_RETRIEVAL_DOCS


def retrieve_context(repo_id: str, question: str) -> list[Document]:
    """Retrieve the most relevant document chunks for a given question."""
    vectorstore = get_vectorstore(repo_id)
    if not vectorstore:
        return []

    retriever = vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={"k": MAX_RETRIEVAL_DOCS, "fetch_k": MAX_RETRIEVAL_DOCS * 2},
    )

    docs = retriever.invoke(question)
    return docs


def format_context(docs: list[Document]) -> tuple[str, list[dict]]:
    """Format retrieved docs into a context string and source list."""
    context_parts = []
    sources = []

    for doc in docs:
        path = doc.metadata.get("relative_path", "unknown")
        context_parts.append(f"### {path}\n{doc.page_content}")
        sources.append({
            "file": path,
            "filename": doc.metadata.get("filename", ""),
        })

    context = "\n\n---\n\n".join(context_parts)
    unique_sources = list({s["file"]: s for s in sources}.values())
    return context, unique_sources