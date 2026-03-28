import os
import sys
import json
from crewai import Agent, Task, Crew, Process
from .utils import llm, clean_json_response

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from vector_db import search_runbooks

compliance_agent = Agent(
    role="Senior SRE Security & Compliance Reviewer",
    goal="Act as a highly suspicious gatekeeper to block AI-generated code fixes that might introduce subtle security flaws, race conditions, or broaden the attack surface.",
    backstory=(
        "You are the most paranoid security engineer in the company. Your job is to review every single code patch or remediation step proposed by the AI Fixer Agent "
        "BEFORE it gets submitted to GitHub or executed. You know that AI models tend to optimize for passing tests quickly, rather than building secure systems. You look "
        "past the obvious generic checks and actively hunt for subtle flaws: race conditions in the fix, unvalidated inputs, and "
        "patches that widen the attack surface just to stop a crash. If a fix introduces a new vulnerability, you block it immediately."
    ),
    llm=llm,
    verbose=False,
)

def run_compliance(action_plan: list, incident_context: str) -> dict:
    historical_context = "No relevant historical incidents found."
    playbooks = search_runbooks(json.dumps(action_plan), limit=1)
    
    if playbooks:
        best_match = playbooks[0]
        if best_match["score"] > 0.2:  
            historical_context = (
                f"Title: {best_match['title']}\n"
                f"Historical Context: {best_match['root_cause_analysis']}\n"
                f"WARNING: Ensure the proposed AI fix does not repeat past failures or contradict this context."
            )

    compliance_task = Task(
        description=(
            f"Review the following context and proposed Fixer action plan:\n\n"
            f"INCIDENT CONTEXT:\n{incident_context}\n\n"
            f"PROPOSED ACTION PLAN (Patch/Fix):\n{json.dumps(action_plan, indent=2)}\n\n"
            f"INSTITUTIONAL MEMORY (QDRANT):\n{historical_context}\n\n"
            f"SECURITY POLICIES & CODE REVIEW DIRECTIVES:\n"
            f"1. SUBTLE FLAWS: Do not just check for obvious holes like SQL injection. Hunt for subtle vulnerabilities.\n"
            f"2. RACE CONDITIONS: Ensure the fix doesn't introduce concurrency bugs or race conditions.\n"
            f"3. ATTACK SURFACE: Ensure a patch that fixes a crash doesn't widen the attack surface by adding new unvalidated inputs.\n"
            f"4. OWASP & CONTEXT: Apply OWASP principles tailored to the specific patterns of this infrastructure.\n"
            f"5. HARD FAILURES: No dropping production databases. No exposing sensitive ports (e.g. 22, 3306) to 0.0.0.0.\n\n"
            f"Evaluate the PROPOSED ACTION PLAN against the directives above. "
            f"You must respond with ONLY a valid JSON object (no markdown, no explanation, no extra text) "
            f"with exactly these fields:\n"
            f"- is_compliant: true or false\n"
            f"- violations: a list of strings detailing any subtle flaws, race conditions, or policy violations found (empty list if none)\n"
            f"- reasoning: a short explanation of your decision reviewing the AI's proposal"
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
