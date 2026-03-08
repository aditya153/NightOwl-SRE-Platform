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

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s │ %(name)s │ %(levelname)s │ %(message)s",
)
logger = logging.getLogger("nightowl.gateway")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🦉 NightOwl Agent Gateway starting...")
    logger.info(f"   Environment: {settings.ENVIRONMENT}")
    logger.info(f"   Version:     {settings.API_VERSION}")
    yield
    logger.info("🦉 NightOwl Agent Gateway shutting down...")

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered SRE platform — autonomous incident detection, diagnosis, and resolution",
    version=settings.API_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    return HealthResponse(
        status="healthy",
        service="agent-gateway",
        version=settings.API_VERSION,
        timestamp=datetime.utcnow(),
    )

@app.get("/", tags=["System"])
async def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.API_VERSION,
        "status": "running",
        "docs": "/docs",
    }

@app.post(
    "/api/v1/incidents",
    response_model=IncidentResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Incidents"],
)
async def create_incident(event: IncidentEvent):
    logger.info(f"📨 New incident: {event.title}")
    logger.info(f"   Severity: {event.severity.value} | Type: {event.incident_type.value}")
    logger.info(f"   Source: {event.source}")
    agents = _get_agents_for_type(event.incident_type)
    return IncidentResponse(
        incident_id=f"NO-{event.source.upper()[:3]}-{datetime.utcnow().strftime('%H%M%S')}",
        status="received",
        severity=event.severity,
        assigned_agents=agents,
        message=f"Incident received. Dispatching agents: {', '.join(agents)}",
    )

@app.get("/api/v1/incidents", tags=["Incidents"])
async def list_incidents():
    return {"incidents": [], "total": 0, "message": "Database not connected yet — coming soon"}

@app.get("/api/v1/agents", tags=["Agents"])
async def list_agents():
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

def _get_agents_for_type(incident_type: IncidentType) -> list[str]:
    agent_map = {
        IncidentType.INFRASTRUCTURE: ["Triage", "Log Analyst", "Correlator", "Fixer"],
        IncidentType.SECURITY: ["Triage", "Security", "Compliance"],
        IncidentType.DEPLOYMENT: ["Triage", "Log Analyst", "Fixer"],
        IncidentType.PERFORMANCE: ["Triage", "Correlator", "Log Analyst"],
        IncidentType.COMPLIANCE: ["Compliance", "Security"],
    }
    return agent_map.get(incident_type, ["Triage"])
