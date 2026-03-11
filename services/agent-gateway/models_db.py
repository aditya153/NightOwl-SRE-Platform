from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class IncidentDB(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    source = Column(String(50), nullable=False)
    payload = Column(JSON, nullable=True)
    severity = Column(String(50), nullable=True)
    status = Column(String(50), default="received")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    logs = relationship("AgentLogDB", back_populates="incident", cascade="all, delete-orphan")

class AgentLogDB(Base):
    __tablename__ = "agent_logs"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    agent_name = Column(String(100), nullable=False)
    action = Column(String(100), nullable=False)
    reasoning = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    incident = relationship("IncidentDB", back_populates="logs")
