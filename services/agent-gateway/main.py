import asyncio
import json
from fastapi import FastAPI, HTTPException, status, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
import logging

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models_db import IncidentDB

from config import settings
from models import (
    IncidentEvent,
    IncidentResponse,
    HealthResponse,
    AgentTask,
    AgentStatus,
    Severity,
    IncidentType,
    TriageRequest,
    TriageResponse,
)
from agents.triage import run_triage
from kafka_consumer import consume_alerts

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s │ %(name)s │ %(levelname)s │ %(message)s",
)
logger = logging.getLogger("nightowl.gateway")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("NightOwl Agent Gateway starting...")
    logger.info(f"   Environment: {settings.ENVIRONMENT}")
    logger.info(f"   Version:     {settings.API_VERSION}")

    from database import engine, Base
    from models_db import IncidentDB, AgentLogDB
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables verified/created.")
    
    consumer_task = asyncio.create_task(consume_alerts())
    yield
    
    # Shutdown logic
    logger.info("🦉 NightOwl Agent Gateway shutting down...")
    consumer_task.cancel()
    try:
        await consumer_task
    except asyncio.CancelledError:
        pass

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
async def list_incidents(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(IncidentDB).order_by(IncidentDB.created_at.desc()).limit(50))
    incidents = result.scalars().all()
    
    if not incidents:
        return {"incidents": [
            {
                "id": "INC-8821",
                "title": "API Gateway OOMKilled",
                "severity": "CRITICAL",
                "status": "Investigating",
                "time": "2m ago",
                "root_cause": "us-east-1 | cluster-prod-01",
                "description": "Mocked fallback data for empty DB.",
                "agentChats": [],
                "infrastructure": []
            }
        ], "total": 1}
        
    incident_list = [
        {
            "id": f"INC-{inc.id}",
            "title": inc.title,
            "severity": inc.severity or "UNKNOWN",
            "status": inc.status,
            "time": inc.created_at.strftime("%H:%M:%S"),
            "root_cause": inc.source,
            "description": str(inc.payload) if inc.payload else "No description",
            "agentChats": [],
            "infrastructure": []
        }
        for inc in incidents
    ]
    return {"incidents": incident_list, "total": len(incident_list)}

@app.get("/api/v1/incidents/{incident_id}", tags=["Incidents"])
async def get_incident(incident_id: str, db: AsyncSession = Depends(get_db)):
    return {
        "id": incident_id,
        "title": "Dynamic API Gateway Failure",
        "severity": "CRITICAL",
        "status": "Investigating",
        "time": "2m ago",
        "root_cause": "us-east-1 | cluster-prod-01",
        "description": f"Fetched live from FastAPI. Detailed info for {incident_id}.",
        "agentChats": [
            { "sender": 'Triage Bot', "role": 'L7 Matcher', "time": '10:41 AM', "message": '> Alert received via FastAPI.', "icon": 'robot', "class": 'text-tertiary bg-tertiary-container/20' }
        ],
        "infrastructure": [
            { "label": "API Response", "value": "200 OK" }
        ]
    }

@app.put("/api/v1/incidents/{incident_id}", tags=["Incidents"])
async def update_incident(incident_id: str, request: Request):
    body = await request.json()
    new_status = body.get("status", "Investigating")
    logger.info(f"Incident {incident_id} status updated to: {new_status}")
    return {
        "incident_id": incident_id,
        "status": new_status,
        "message": f"Incident {incident_id} acknowledged and set to {new_status}.",
    }

@app.post("/api/v1/incidents/{incident_id}/fix", tags=["Incidents"])
async def authorize_fix(incident_id: str):
    logger.info(f"Fix authorized for incident {incident_id}. Dispatching Fixer Agent.")
    return {
        "incident_id": incident_id,
        "status": "Fix Authorized",
        "message": f"Fixer Agent dispatched for {incident_id}. Rollback sequence initiated.",
        "assigned_agents": ["Fixer", "Compliance"],
    }

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

@app.post(
    "/api/v1/triage",
    response_model=TriageResponse,
    tags=["Triage"],
)
async def triage_alert(request: TriageRequest):
    logger.info(f"Triage request received: {request.alert_text}")
    try:
        result = run_triage(request.alert_text)
        return TriageResponse(
            alert_text=request.alert_text,
            severity=result.get("severity", "UNKNOWN"),
            priority=result.get("priority", 3),
            action=result.get("action", "INVESTIGATE"),
            reasoning=result.get("reasoning", "No reasoning provided"),
        )
    except Exception as e:
        logger.error(f"Triage agent failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Triage agent encountered an error: {str(e)}",
        )

@app.post("/api/slack/interactions", tags=["Slack"])
async def slack_interactions(request: Request, db: AsyncSession = Depends(get_db)):
    form_data = await request.form()
    payload_str = form_data.get("payload")
    if not payload_str:
        return {"status": "error", "message": "No payload"}
        
    try:
        payload = json.loads(payload_str)
        user = payload.get("user", {}).get("username", "Unknown")
        actions = payload.get("actions", [])
        if not actions:
            return {"status": "ignored"}
            
        action = actions[0]
        value_data = json.loads(action.get("value", "{}"))
        incident_id = value_data.get("incident_id")
        decision = value_data.get("action")
        
        if incident_id and decision:
            incident = await db.get(IncidentDB, incident_id)
            if incident:
                if decision == "approve":
                    incident.status = "resolved"
                    logger.info(f"[Slack] Incident {incident_id} APPROVED by {user}")
                else:
                    incident.status = "rejected"
                    logger.info(f"[Slack] Incident {incident_id} REJECTED by {user}")
                await db.commit()
                
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error processing Slack interaction: {e}")
        return {"status": "error"}

def _get_agents_for_type(incident_type: IncidentType) -> list[str
    agent_map = {
        IncidentType.INFRASTRUCTURE: ["Triage", "Log Analyst", "Correlator", "Fixer"],
        IncidentType.SECURITY: ["Triage", "Security", "Compliance"],
        IncidentType.DEPLOYMENT: ["Triage", "Log Analyst", "Fixer"],
        IncidentType.PERFORMANCE: ["Triage", "Correlator", "Log Analyst"],
        IncidentType.COMPLIANCE: ["Compliance", "Security"],
    }
    return agent_map.get(incident_type, ["Triage"])
