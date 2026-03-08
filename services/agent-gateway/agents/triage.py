import json
from crewai import Agent, Task, Crew, Process, LLM
from config import settings

llm = LLM(
    model=f"openrouter/{settings.OPENROUTER_MODEL}",
    api_key=settings.OPENROUTER_API_KEY,
)

triage_agent = Agent(
    role="Senior SRE Triage Specialist",
    goal="Analyze incoming infrastructure alerts and classify their severity, priority, and recommended action",
    backstory=(
        "You are a senior Site Reliability Engineer with 10 years of experience "
        "handling production incidents at large scale companies. You have seen thousands "
        "of alerts and know exactly how to classify them. You understand the difference "
        "between a noisy alert and a real outage. Your job is to quickly assess incoming "
        "alerts and provide a structured triage response so the right team can act fast."
    ),
    llm=llm,
    verbose=False,
)

def run_triage(alert_text: str) -> dict:
    triage_task = Task(
        description=(
            f"Analyze the following alert and provide a triage assessment:\n\n"
            f"ALERT: {alert_text}\n\n"
            f"You must respond with ONLY a valid JSON object (no markdown, no explanation, no extra text) "
            f"with exactly these fields:\n"
            f"- severity: one of CRITICAL, HIGH, MEDIUM, LOW, INFO\n"
            f"- priority: a number from 1 (highest) to 5 (lowest)\n"
            f"- action: one of INVESTIGATE, RESTART, SCALE_UP, ROLLBACK, MONITOR, IGNORE\n"
            f"- reasoning: a short explanation of why you chose this classification"
        ),
        expected_output="A JSON object with severity, priority, action, and reasoning fields",
        agent=triage_agent,
    )

    crew = Crew(
        agents=[triage_agent],
        tasks=[triage_task],
        process=Process.sequential,
        verbose=False,
    )

    result = crew.kickoff()
    raw_output = result.raw

    try:
        parsed = json.loads(raw_output)
    except json.JSONDecodeError:
        parsed = {
            "severity": "UNKNOWN",
            "priority": 3,
            "action": "INVESTIGATE",
            "reasoning": raw_output,
        }

    return parsed
