import json
import asyncio
import os
import sys
from crewai import Agent, Task, Crew, LLM
from config import settings

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from mcp_client import AgentMCPClient

llm = LLM(
    model=f"openrouter/{settings.OPENROUTER_MODEL}",
    api_key=settings.OPENROUTER_API_KEY,
)

MCP_SERVERS = {
    "kubernetes": {
        "command": sys.executable,
        "args": [os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "mcp_servers", "kubernetes_server.py")]
    },
    "github": {
        "command": sys.executable,
        "args": [os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "mcp_servers", "github_server.py")]
    }
}

async def load_mcp_tools() -> list:
    all_tools = []
    clients = []
    for server_name, config in MCP_SERVERS.items():
        client = AgentMCPClient(command=config["command"], args=config["args"])
        await client.connect()
        tools = await client.get_crewai_tools()
        all_tools.extend(tools)
        clients.append(client)
    return all_tools, clients

def run_fixer(incident_context: str) -> dict:
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    mcp_tools, clients = loop.run_until_complete(load_mcp_tools())

    fixer_agent = Agent(
        role="Senior Site Reliability Engineer (Remediation)",
        goal=(
            "Safely propose and execute remediation steps to fix root causes identified by the Correlator. "
            "You must ONLY execute actions if you are 100% confident they are safe and minimal. "
            "If there is any risk of data loss, widespread downtime, or unknown side effects, you MUST escalate to a human."
        ),
        backstory=(
            "You are a veteran SRE who has seen it all. You know that hastily applied fixes often cause bigger outages than the original problem. "
            "You strictly adhere to the Human-in-the-Loop philosophy. You always prefer to clear a cache or restart a stateless pod rather than running database migrations or dropping tables autonomously. "
            "You understand that you have physical write access to the infrastructure, meaning your actions have real-world consequences."
        ),
        tools=mcp_tools,
        llm=llm,
        verbose=True,
        allow_delegation=False
    )

    task = Task(
        description=f"""
        Review the following resolved incident context:
        {incident_context}
        
        Determine the safest, most minimal remediation steps to resolve this.
        
        Rules for Human Approval:
        1. If the fix involves restarting a stateless pod, clearing a cache, or scaling up replicas, set requires_human_approval to false.
        2. If the fix involves modifying a database, changing routing rules, running scripts, deleting data, or if you are unsure, set requires_human_approval to true.
        
        OUTPUT FORMAT (Strict JSON string ONLY, do not wrap in markdown blocks):
        {{
            "risk_level": "LOW|MEDIUM|HIGH",
            "action_plan": ["step 1", "step 2"],
            "requires_human_approval": true/false,
            "tools_used": ["tool_name_1"]
        }}
        """,
        expected_output="Strict JSON string with risk_level, action_plan, requires_human_approval, and tools_used.",
        agent=fixer_agent,
    )

    crew = Crew(
        agents=[fixer_agent],
        tasks=[task],
        verbose=False
    )

    result = crew.kickoff()

    for client in clients:
        try:
            loop.run_until_complete(client.disconnect())
        except RuntimeError:
            # anyio throws this if context is closed from a different asyncio task
            pass
    loop.close()

    raw_text = result.raw.strip()
    if raw_text.startswith("```json"):
        raw_text = raw_text.replace("```json\n", "").replace("\n```", "").replace("```", "")

    try:
        parsed_result = json.loads(raw_text)
        return parsed_result
    except json.JSONDecodeError:
        return {
            "error": "Failed to parse LLM Output",
            "raw_output": raw_text,
            "requires_human_approval": True
        }
