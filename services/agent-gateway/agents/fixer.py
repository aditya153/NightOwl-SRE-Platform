import json
from crewai import Agent, Task, Crew, LLM
from config import settings
from .tools import restart_kubernetes_pod, clear_redis_cache, rollback_deployment, scale_up_replicas

llm = LLM(
    model=f"openrouter/{settings.OPENROUTER_MODEL}",
    api_key=settings.OPENROUTER_API_KEY,
)

# Define the Fixer Agent with strict safety instructions
fixer_agent = Agent(
    role="Senior Site Reliability Engineer (Remediation)",
    goal="""Safely propose and execute remediation steps to fix root causes identified by the Correlator. 
            You must ONLY execute actions if you are 100% confident they are safe and minimal.
            If there is any risk of data loss, widespread downtime, or unknown side effects, you MUST escalate to a human.""",
    backstory="""You are a veteran SRE who has seen it all. You know that hastily applied 'fixes' often cause bigger outages than the original problem. 
                 You strictly adhere to the Human-in-the-Loop philosophy. You always prefer to clear a cache or restart a stateless pod rather than running database migrations or dropping tables autonomously.
                 You understand that you have physical write access to the infrastructure, meaning your actions have real-world consequences.""",
    tools=[restart_kubernetes_pod, clear_redis_cache, rollback_deployment, scale_up_replicas],
    llm=llm,
    verbose=True,
    allow_delegation=False
)

def run_fixer(incident_context: str) -> dict:
    """
    Simulates the Fixer Agent deciding on an action plan based on the incident context.
    It returns strict JSON with the action plan and whether a human needs to approve it.
    """
    
    task = Task(
        description=f"""
        Review the following resolved incident context:
        {incident_context}
        
        Determine the safest, most minimal remediation steps to resolve this.
        
        Rules for Human Approval:
        1. If the fix involves restarting a stateless pod, clearing a cache, or scaling up replicas, set `requires_human_approval` to false.
        2. If the fix involves modifying a database, changing routing rules, running scripts, deleting data, or if you are unsure, set `requires_human_approval` to true.
        
        OUTPUT FORMAT (Strict JSON string ONLY, do not wrap in markdown blocks like ```json):
        {{
            "risk_level": "LOW|MEDIUM|HIGH",
            "action_plan": ["step 1", "step 2"],
            "requires_human_approval": true/false
        }}
        """,
        expected_output="Strict JSON string with risk_level, action_plan, and requires_human_approval.",
        agent=fixer_agent,
    )

    crew = Crew(
        agents=[fixer_agent],
        tasks=[task],
        verbose=False
    )
    
    result = crew.kickoff()
    
    raw_text = result.raw.strip()
    # Clean up markdown if the LLM hallucinated it
    if raw_text.startswith("```json"):
        raw_text = raw_text.replace("```json\n", "").replace("\n```", "").replace("```", "")
    
    try:
        parsed_result = json.loads(raw_text)
        return parsed_result
    except json.JSONDecodeError:
        return {
            "error": "Failed to parse LLM Output",
            "raw_output": raw_text,
            "requires_human_approval": True # Fail safe
        }
