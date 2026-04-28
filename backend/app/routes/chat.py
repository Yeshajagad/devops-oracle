from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.retriever import retrieve_context, format_context
from app.services.llm import generate_answer, generate_answer_no_context

router = APIRouter()


class ChatRequest(BaseModel):
    question: str
    repo_id: str | None = None


@router.post("/chat")
async def chat(request: ChatRequest):
    """Answer a developer question with optional codebase context."""
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    if not request.repo_id:
        answer = generate_answer_no_context(question)
        return {"answer": answer, "sources": [], "has_context": False}

    try:
        docs = retrieve_context(request.repo_id, question)
        context, sources = format_context(docs)

        if not docs:
            answer = generate_answer_no_context(question)
            return {"answer": answer, "sources": [], "has_context": False}

        answer = generate_answer(question, context)
        return {
            "answer": answer,
            "sources": sources,
            "has_context": True,
            "docs_retrieved": len(docs)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")