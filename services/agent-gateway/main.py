"""
NightOwl Agent Gateway — Main Application
==========================================
This is the entry point, the core API of the entire platform.

What does this file do?
- Creates the FastAPI app
- Defines API endpoints (URLs the app responds to)
- Handles incoming incident events
- Will eventually orchestrate AI agents (coming in Day 4+)

How to run:
    uvicorn main:app --reload --port 8000
    Then open: http://localhost:8000/docs
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
import logging

from config import settings
from models import (
    IncidentEvent,
    IncidentResponse,
    HealthResponse,
    AgentTask,
    AgentStatus,
    Severity,
    IncidentType,
)


# ── Logging Setup ────────────────────────────────────────
# Why logging instead of print()?
# - Shows timestamp, severity level, module name
# - Can be filtered (show only errors in production)
# - Can be sent to monitoring tools later
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s │ %(name)s │ %(levelname)s │ %(message)s",
)
logger = logging.getLogger("nightowl.gateway")


# ── App Lifecycle ────────────────────────────────────────
# This runs when the app starts and when it shuts down.
# Later we'll connect to Kafka, databases, etc. here.
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🦉 NightOwl Agent Gateway starting...")
    logger.info(f"   Environment: {settings.ENVIRONMENT}")
    logger.info(f"   Version:     {settings.API_VERSION}")
    # TODO (Day 5+): Connect to Kafka
    # TODO (Day 6+): Connect to PostgreSQL
    # TODO (Day 4+): Register AI agents
    yield
    logger.info("🦉 NightOwl Agent Gateway shutting down...")


# ── Create the App ───────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered SRE platform — autonomous incident detection, diagnosis, and resolution",
    version=settings.API_VERSION,
    lifespan=lifespan,
)

# CORS = which websites can call our API
# Without this, a React frontend on localhost:3000 can't talk to us
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════
# ENDPOINTS — The URLs our API responds to
# ═══════════════════════════════════════════════════════════


# ── Health Check ─────────────────────────────────────────
# Why do we need this?
# Kubernetes/Docker uses this to check if the app is alive.
# If /health returns an error, K8s will restart the container.
@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Check if the Agent Gateway is running."""
    return HealthResponse(
        status="healthy",
        service="agent-gateway",
        version=settings.API_VERSION,
        timestamp=datetime.utcnow(),
    )


@app.get("/", tags=["System"])
async def root():
    """Root endpoint — shows basic API info."""
    return {
        "service": settings.APP_NAME,
        "version": settings.API_VERSION,
        "status": "running",
        "docs": "/docs",
    }


# ── Incident Endpoints ──────────────────────────────────
# This is where incidents come in from GitHub, Grafana, K8s, Slack.
# For now, we receive and acknowledge. Later, we'll process with AI.

@app.post(
    "/api/v1/incidents",
    response_model=IncidentResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Incidents"],
)
async def create_incident(event: IncidentEvent):
    """
    Receive a new incident and dispatch AI agents.
    
    Flow (once fully built):
    1. Validate the incoming event (Pydantic does this)
    2. Classify severity and determine agent team
    3. Publish to Kafka for async processing
    4. Spawn CrewAI agents to handle the incident
    5. Return tracking ID
    """
    logger.info(f"📨 New incident: {event.title}")
    logger.info(f"   Severity: {event.severity.value} | Type: {event.incident_type.value}")
    logger.info(f"   Source: {event.source}")

    # Determine which agents should handle this type of incident
    agents = _get_agents_for_type(event.incident_type)

    # TODO (Day 4+): Publish event to Kafka
    # TODO (Day 4+): Spawn CrewAI agent team
    # TODO (Day 6+): Store in PostgreSQL

    return IncidentResponse(
        incident_id=f"NO-{event.source.upper()[:3]}-{datetime.utcnow().strftime('%H%M%S')}",
        status="received",
        severity=event.severity,
        assigned_agents=agents,
        message=f"Incident received. Dispatching agents: {', '.join(agents)}",
    )


@app.get("/api/v1/incidents", tags=["Incidents"])
async def list_incidents():
    """List all tracked incidents (coming when DB is connected)."""
    return {"incidents": [], "total": 0, "message": "Database not connected yet — coming soon"}


# ── Agent Endpoints ──────────────────────────────────────
# Shows what AI agents are available in the system
@app.get("/api/v1/agents", tags=["Agents"])
async def list_agents():
    """List all AI agents and their current status."""
    agents = [
        AgentTask(name="Triage", role="Severity classification & priority routing", status=AgentStatus.IDLE),
        AgentTask(name="Log Analyst", role="Pattern detection & root cause analysis", status=AgentStatus.IDLE),
        AgentTask(name="Correlator", role="Cross-metric analysis using PromQL", status=AgentStatus.IDLE),
        AgentTask(name="Fixer", role="Automated remediation — restart, rollback, scale", status=AgentStatus.IDLE),
        AgentTask(name="Security", role="SAST, CVE scanning, secret detection", status=AgentStatus.IDLE),
        AgentTask(name="Compliance", role="SOC2 & GDPR policy enforcement", status=AgentStatus.IDLE),
        AgentTask(name="PostMortem", role="Auto-generated incident reports & timelines", status=AgentStatus.IDLE),
    ]
    return {"agents": [a.model_dump() for a in agents], "total": len(agents)}


# ── Helper Functions ─────────────────────────────────────
def _get_agents_for_type(incident_type: IncidentType) -> list[str]:
    """
    Which agents should handle which type of incident?
    
    Not every incident needs all 7 agents.
    A security breach doesn't need the Fixer (yet).
    A pod crash doesn't need Compliance.
    """
    agent_map = {
        IncidentType.INFRASTRUCTURE: ["Triage", "Log Analyst", "Correlator", "Fixer"],
        IncidentType.SECURITY: ["Triage", "Security", "Compliance"],
        IncidentType.DEPLOYMENT: ["Triage", "Log Analyst", "Fixer"],
        IncidentType.PERFORMANCE: ["Triage", "Correlator", "Log Analyst"],
        IncidentType.COMPLIANCE: ["Compliance", "Security"],
    }
    return agent_map.get(incident_type, ["Triage"])
