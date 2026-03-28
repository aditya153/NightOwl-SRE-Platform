import json
from crewai import Agent, Task, Crew, Process
from .utils import llm, clean_json_response

compliance_agent = Agent(
    role="Senior Security and Compliance Auditor",
    goal="Audit proposed incident remediation action plans and ensure they do not violate any organizational security, compliance, or reliability policies",
    backstory=(
        "You are a strict and meticulous Security Engineer working for a highly regulated financial institution. "
        "Your single job is to prevent Cowboy Engineering. You review proposed action plans from SREs and immediately "
        "block any actions that could result in data loss, unauthorized access, exposed ports, or widespread unscheduled downtime. "
        "You always default to safety. If you are not absolutely perfectly sure a step is safe, you reject it."
    ),
    llm=llm,
    verbose=False,
)

def run_compliance(action_plan: list, incident_context: str) -> dict:
    compliance_task = Task(
        description=(
            f"Review the following context and proposed remediation action plan:\n\n"
            f"INCIDENT CONTEXT:\n{incident_context}\n\n"
            f"PROPOSED ACTION PLAN:\n{json.dumps(action_plan, indent=2)}\n\n"
            f"SECURITY POLICIES:\n"
            f"1. No dropping or deleting production databases or tables.\n"
            f"2. No exposing sensitive ports (e.g., 22, 3306) to the public internet (0.0.0.0).\n"
            f"3. No restarting the entire Kubernetes cluster; only individual pods or deployments can be restarted.\n"
            f"4. Do not run any destructive scripts without explicit human approval.\n\n"
            f"Evaluate the PROPOSED ACTION PLAN against the SECURITY POLICIES. "
            f"You must respond with ONLY a valid JSON object (no markdown, no explanation, no extra text) "
            f"with exactly these fields:\n"
            f"- is_compliant: true or false\n"
            f"- violations: a list of strings detailing any policy violations found (empty list if none)\n"
            f"- reasoning: a short explanation of your decision"
        ),
        expected_output="A strict JSON object with is_compliant, violations, and reasoning fields.",
        agent=compliance_agent,
    )

    crew = Crew(
        agents=[compliance_agent],
        tasks=[compliance_task],
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
            "is_compliant": False,
            "violations": ["Failed to parse LLM Output for compliance validation"],
            "reasoning": raw_output,
        }

    return parsed
