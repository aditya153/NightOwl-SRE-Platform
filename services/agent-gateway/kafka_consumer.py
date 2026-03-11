import json
import asyncio
import logging
from aiokafka import AIOKafkaConsumer
import os

from agents.triage import run_triage
from database import AsyncSessionLocal
from models_db import IncidentDB, AgentLogDB

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "localhost:9092")
TOPIC = "alerts-topic"

async def consume_alerts():
    consumer = AIOKafkaConsumer(
        TOPIC,
        bootstrap_servers=KAFKA_BROKER,
        group_id="nightowl-agent-group",
        value_deserializer=lambda m: json.loads(m.decode("utf-8")),
        auto_offset_reset="latest",
    )
    
    await consumer.start()
    logger.info(f"[KAFKA CONSUMER] Started listening on '{TOPIC}' at {KAFKA_BROKER}")
    
    try:
        async for msg in consumer:
            alert_data = msg.value
            logger.info(f"[KAFKA CONSUMER] Received alert from {alert_data.get('source', 'unknown')}: {alert_data.get('payload', {})}")
            
            # Save incoming incident to DB
            source = alert_data.get('source', 'unknown')
            payload = alert_data.get('payload', {})
            title = payload.get('title') or payload.get('event') or 'Unknown Incident'

            async with AsyncSessionLocal() as session:
                new_incident = IncidentDB(
                    title=title,
                    source=source,
                    payload=payload
                )
                session.add(new_incident)
                await session.commit()
                await session.refresh(new_incident)
                incident_id = new_incident.id
                logger.info(f"[DB] Saved incoming incident with ID: {incident_id}")
            
            # Trigger the AI Triage Agent
            logger.info("[AGENT GATEWAY] Waking up Triage Agent...")
            try:
                alert_text = json.dumps(alert_data)
                
                # We offload the synchronous CrewAI execution to a thread to not block the async Kafka loop
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    None, 
                    run_triage, 
                    alert_text
                )
                
                logger.info(f"[AGENT SUMMARY] Triage Complete:\n{json.dumps(result, indent=2)}")

                # Save AI reasoning back to DB
                async with AsyncSessionLocal() as session:
                    agent_log = AgentLogDB(
                        incident_id=incident_id,
                        agent_name="Triage Agent",
                        action=result.get("action", "UNKNOWN"),
                        reasoning=result.get("reasoning", "No reasoning provided")
                    )
                    
                    # Update the IncidentDB record with severity
                    incident = await session.get(IncidentDB, incident_id)
                    if incident:
                        incident.severity = result.get("severity", "UNKNOWN")
                        incident.status = "triaged"
                        
                    session.add(agent_log)
                    await session.commit()
                    logger.info(f"[DB] Updated Incident #{incident_id} and saved Agent Log")

            except Exception as e:
                logger.error(f"[AGENT ERROR] Failed to triage alert: {str(e)}")
                
    except asyncio.CancelledError:
        logger.info("[KAFKA CONSUMER] Stopping...")
    finally:
        await consumer.stop()
        logger.info("[KAFKA CONSUMER] Stopped.")
