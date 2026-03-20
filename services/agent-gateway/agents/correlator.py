import json
from crewai import Agent, Task, Crew, Process
from .utils import llm, clean_json_response

correlator_agent = Agent(
    role="Senior Incident Commander",
    goal="Analyze multiple concurrent alerts and determine if they share a common root cause.",
    backstory=(
        "You are the Director of Site Reliability Engineering. You excel at seeing the big picture. "
        "When a database goes down, you know that the immediate API 500 errors and frontend timeouts "
        "are just symptoms of the database failure. Your job is to read multiple alerts firing simultaneously "
        "and cluster them into a single, cohesive incident report to prevent engineer alert fatigue."
    ),
    llm=llm,
    verbose=False,
)

def run_correlation(alerts: list[str]) -> dict:
    alerts_text = "\n\n---\n\n".join(alerts)
    
    correlation_task = Task(
        description=(
            f"Analyze the following list of concurrent system alerts:\n\n"
            f"{alerts_text}\n\n"
            f"Determine if these alerts are symptoms of the same underlying incident.\n"
            f"You must respond with ONLY a valid JSON object (no markdown, no extra text) "
            f"containing exactly these fields:\n"
            f"- is_related: boolean (true if they share a root cause, false if they are independent issues)\n"
            f"- primary_cause: A 1-2 sentence description of the deduced root cause (e.g., 'Primary Database Outage causing cascading API failures')\n"
            f"- confidence: one of HIGH, MEDIUM, LOW"
        ),
        expected_output="A strict JSON object with is_related, primary_cause, and confidence.",
        agent=correlator_agent,
    )

    crew = Crew(
        agents=[correlator_agent],
        tasks=[correlation_task],
        process=Process.sequential,
        verbose=False,
    )

    result = crew.kickoff()
    raw_output = result.raw
    cleaned = clean_json_response(raw_output)

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        parsed = {
            "is_related": False,
            "primary_cause": "Failed to parse the LLM output into JSON.",
            "confidence": "LOW"
        }

    return parsed
