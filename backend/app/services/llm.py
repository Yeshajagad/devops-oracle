from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from app.config import GROQ_API_KEY, LLM_MODEL

SYSTEM_PROMPT = """You are DevOps Oracle, an expert AI assistant that deeply understands codebases.

You are given relevant code snippets and files from a project. Your job is to:
- Answer questions specifically about THIS project using the provided code context
- Give exact file paths where changes should be made
- Provide code that matches the project's existing style and conventions
- Help debug errors with project-specific fixes
- Explain the codebase clearly for both beginners and experts

Rules:
- Always reference actual files from the context when possible
- Format code in proper markdown code blocks with the language specified
- If the context doesn't contain enough info, say so clearly
- Be concise but thorough
- For deployment issues, check config files in the context"""


def get_llm():
    return ChatGroq(
        api_key=GROQ_API_KEY,
        model_name=LLM_MODEL,
        temperature=0.2,
        max_tokens=2048,
    )


def generate_answer(question: str, context: str) -> str:
    """Generate an answer using Groq + Llama 3 with retrieved context."""
    llm = get_llm()

    user_message = f"""Project context from codebase:

{context}

---

Developer question: {question}

Please provide a detailed, project-specific answer based on the code above."""

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=user_message),
    ]

    response = llm.invoke(messages)
    return response.content


def generate_answer_no_context(question: str) -> str:
    """Fallback when no repo is indexed yet."""
    llm = get_llm()
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=f"No codebase is loaded. Answer generally: {question}"),
    ]
    response = llm.invoke(messages)
    return response.content