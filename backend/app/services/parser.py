from langchain.schema import Document


def parse_files_to_documents(files: list[dict], source_name: str) -> list[Document]:
    """Convert raw file dicts into LangChain Document objects."""
    documents = []

    for file in files:
        content = file.get("content", "").strip()
        if not content:
            continue

        metadata = {
            "source": source_name,
            "filename": file.get("filename", ""),
            "relative_path": file.get("relative_path", ""),
            "extension": file.get("extension", ""),
        }

        header = f"# File: {file.get('relative_path', '')}\n\n"
        full_content = header + content

        documents.append(Document(page_content=full_content, metadata=metadata))

    return documents