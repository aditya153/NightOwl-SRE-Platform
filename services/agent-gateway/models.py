"""
NightOwl — Data Models
======================
Pydantic models that define the shape of all data in the system.

Why Pydantic?
- Validates data automatically (wrong type? rejected instantly)
- Auto-generates API docs from these models
- Serializes to/from JSON with zero effort
- If someone sends bad data to our API, Pydantic catches it
  before it reaches our business logic
"""

from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime
from typing import Optional


# ── Enums (predefined choices) ───────────────────────────
# These prevent typos and invalid values.
# Instead of accepting any random string for severity,
# we only allow these exact values.

class Severity(str, Enum):
    """How bad is the incident?"""
    CRITICAL = "critical"   # System down, users affected
    HIGH = "high"           # Major feature broken
    MEDIUM = "medium"       # Degraded performance
    LOW = "low"             # Minor issue, no user impact
    INFO = "info"           # Just informational


class IncidentType(str, Enum):
    """What kind of incident is this?"""
    INFRASTRUCTURE = "infrastructure"   # Server/pod/node issues
    SECURITY = "security"               # Vulnerabilities, breaches
    DEPLOYMENT = "deployment"           # Failed deploys, rollbacks
    PERFORMANCE = "performance"         # Slow response, high latency
    COMPLIANCE = "compliance"           # Policy violations


class AgentStatus(str, Enum):
    """What is an AI agent currently doing?"""
    IDLE = "idle"               # Waiting for work
    ANALYZING = "analyzing"     # Looking at the incident
    EXECUTING = "executing"     # Running a fix
    COMPLETED = "completed"     # Done with the task
    FAILED = "failed"           # Something went wrong


# ── Request Models (data coming INTO the API) ────────────

class IncidentEvent(BaseModel):
    """
    What an incident looks like when it arrives.
    
    Example:
    {
        "title": "Pod crash loop in payment-service",
        "source": "kubernetes",
        "severity": "critical",
        "incident_type": "infrastructure",
        "description": "Pod has restarted 5 times in last 10 minutes"
    }
    """
    title: str = Field(
        ...,
        min_length=5,
        max_length=200,
        description="Short title describing the incident",
        examples=["Pod crash loop in payment-service"],
    )
    source: str = Field(
        ...,
        description="Where the incident came from",
        examples=["kubernetes", "grafana", "github", "slack"],
    )
    severity: Severity = Field(
        default=Severity.MEDIUM,
        description="How severe is this incident",
    )
    incident_type: IncidentType = Field(
        ...,
        description="Category of the incident",
    )
    description: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Detailed description of what happened",
    )
    metadata: Optional[dict] = Field(
        default=None,
        description="Extra data from the source (labels, annotations, etc.)",
    )


# ── Response Models (data going OUT of the API) ─────────

class HealthResponse(BaseModel):
    """Response for the /health endpoint."""
    status: str = "healthy"
    service: str = "agent-gateway"
    version: str = "0.1.0"
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class IncidentResponse(BaseModel):
    """What we return after receiving an incident."""
    incident_id: str = Field(
        ...,
        description="Unique tracking ID for this incident",
        examples=["NO-KUB-001"],
    )
    status: str = Field(
        ...,
        description="Current status of the incident",
        examples=["received", "analyzing", "resolved"],
    )
    severity: Severity
    assigned_agents: list[str] = Field(
        ...,
        description="Which AI agents are handling this",
        examples=[["Triage", "Log Analyst", "Fixer"]],
    )
    message: str


class AgentTask(BaseModel):
    """Info about a single AI agent."""
    name: str
    role: str
    status: AgentStatus = AgentStatus.IDLE
