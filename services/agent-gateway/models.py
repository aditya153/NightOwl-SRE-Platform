from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime
from typing import Optional, List

class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class IncidentType(str, Enum):
    INFRASTRUCTURE = "infrastructure"
    SECURITY = "security"
    DEPLOYMENT = "deployment"
    PERFORMANCE = "performance"
    COMPLIANCE = "compliance"

class AgentStatus(str, Enum):
    IDLE = "idle"
    ANALYZING = "analyzing"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"

class IncidentEvent(BaseModel):
    title: str = Field(
        ..., min_length=5, max_length=200,
        description="Short title describing the incident",
        examples=["Pod crash loop in payment-service"],
    )
    source: str = Field(
        ..., description="Where the incident came from",
        examples=["kubernetes", "grafana", "github", "slack"],
    )
    severity: Severity = Field(
        default=Severity.MEDIUM, description="How severe is this incident",
    )
    incident_type: IncidentType = Field(
        ..., description="Category of the incident",
    )
    description: Optional[str] = Field(
        default=None, max_length=2000,
        description="Detailed description of what happened",
    )
    metadata: Optional[dict] = Field(
        default=None, description="Extra data from the source (labels, annotations, etc.)",
    )

class HealthResponse(BaseModel):
    status: str = "healthy"
    service: str = "agent-gateway"
    version: str = "0.1.0"
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class IncidentResponse(BaseModel):
    incident_id: str = Field(..., description="Unique tracking ID for this incident", examples=["NO-KUB-001"])
    status: str = Field(..., description="Current status of the incident", examples=["received", "analyzing", "resolved"])
    severity: Severity
    assigned_agents: List[str] = Field(..., description="Which AI agents are handling this", examples=[["Triage", "Log Analyst", "Fixer"]])
    message: str

class AgentTask(BaseModel):
    name: str
    role: str
    status: AgentStatus = AgentStatus.IDLE

class TriageRequest(BaseModel):
    alert_text: str = Field(
        ..., min_length=5, max_length=1000,
        description="The raw alert text to analyze",
        examples=["High CPU usage on api-server at 95%"],
    )

class TriageResponse(BaseModel):
    alert_text: str
    severity: str
    priority: int
    action: str
    reasoning: str
