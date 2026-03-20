import re
from crewai import LLM
from config import settings

llm = LLM(
    model=f"openrouter/{settings.OPENROUTER_MODEL}",
    api_key=settings.OPENROUTER_API_KEY,
)

def clean_json_response(raw: str) -> str:
    cleaned = raw.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()
