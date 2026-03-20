import json
from crewai import Agent, Task, Crew, Process
from .utils import llm, clean_json_response

log_analyst_agent = Agent(
    role="Senior Application Support Engineer",
    goal="Parse raw, noisy application logs and stack traces, extracting the true root cause of failure.",
    backstory=(
        "You are an elite L3 support engineer who specializes in diagnosing complex bugs "
        "across distributed systems. You excel at reading through hundreds of lines of "
        "irrelevant stack trace noise to pinpoint the exact file, module, and line of code "
        "that triggered the crash. Your structured analysis helps developers patch issues rapidly."
    ),
    llm=llm,
    verbose=False,
)

def run_log_analysis(logs: str) -> dict:
    analysis_task = Task(
        description=(
            f"Analyze the following application log / stack trace:\n\n"
            f"LOGS: {logs}\n\n"
            f"You must respond with ONLY a valid JSON object (no markdown, no extra text) "
            f"containing exactly these fields:\n"
            f"- error_type: The formal name of the exception (e.g., NullPointerException)\n"
            f"- root_cause: A short, 1-2 sentence human-readable summary of what actually broke\n"
            f"- culprit_file: The specific file, module, or class where the error originated (if found, else 'UNKNOWN')\n"
            f"- affected_component: A high-level categorization (e.g., 'Database', 'Auth', 'API Gateway')"
        ),
        expected_output="A strict JSON object with error_type, root_cause, culprit_file, and affected_component.",
        agent=log_analyst_agent,
    )

    crew = Crew(
        agents=[log_analyst_agent],
        tasks=[analysis_task],
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
            "error_type": "PARSE_ERROR",
            "root_cause": "Failed to parse the LLM output into JSON.",
            "culprit_file": "UNKNOWN",
            "affected_component": "UNKNOWN"
        }

    return parsed
