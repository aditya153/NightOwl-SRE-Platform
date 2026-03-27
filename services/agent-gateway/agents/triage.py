import json
import sys
import os
from crewai import Agent, Task, Crew, Process
from .utils import llm, clean_json_response

# Add parent directory to path to allow importing vector_db if run directly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from vector_db import search_runbooks

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
    historical_context = "No specific historical runbooks found."
    playbooks = search_runbooks(alert_text, limit=1)
    
    if playbooks:
        best_match = playbooks[0]
        if best_match["score"] > 0.2:  
            historical_context = (
                f"Title: {best_match['title']}\n"
                f"Root Cause: {best_match['root_cause_analysis']}\n"
                f"Resolution Steps: {best_match['resolution_steps']}"
            )

    triage_task = Task(
        description=(
            f"Analyze the following alert and provide a triage assessment:\n\n"
            f"ALERT: {alert_text}\n\n"
            f"HISTORICAL PLAYBOOK CONTEXT:\n{historical_context}\n\n"
            f"Strictly use the historical context for your diagnosis if it is relevant.\n\n"
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
    cleaned = clean_json_response(raw_output)

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        parsed = {
            "severity": "UNKNOWN",
            "priority": 3,
            "action": "INVESTIGATE",
            "reasoning": raw_output,
        }

    return parsed

