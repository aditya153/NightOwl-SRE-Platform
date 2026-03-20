import json
import asyncio
import logging
from aiokafka import AIOKafkaConsumer
import os

from agents.triage import run_triage
from agents.log_analyst import run_log_analysis
from agents.correlator import run_correlation
from agents.fixer import run_fixer
from database import AsyncSessionLocal
from models_db import IncidentDB, AgentLogDB
from vector_db import init_vector_db, add_incident_resolution_to_memory

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

    init_vector_db()

    try:
        async for msg in consumer:
            alert_data = msg.value
            logger.info(f"[KAFKA CONSUMER] Received alert from {alert_data.get('source', 'unknown')}")

            source = alert_data.get('source', 'unknown')
            payload = alert_data.get('payload', {})
            title = payload.get('title') or payload.get('event') or 'Unknown Incident'
            raw_logs = payload.get('logs', '')
            concurrent_alerts = payload.get('concurrent_alerts', [])

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

            try:
                alert_text = json.dumps(alert_data)
                loop = asyncio.get_event_loop()

                logger.info("[PIPELINE] Stage 1: Triage Agent")
                triage_result = await loop.run_in_executor(None, run_triage, alert_text)
                logger.info(f"[PIPELINE] Triage Complete: {json.dumps(triage_result, indent=2)}")

                async with AsyncSessionLocal() as session:
                    session.add(AgentLogDB(
                        incident_id=incident_id,
                        agent_name="Triage Agent",
                        action=triage_result.get("action", "UNKNOWN"),
                        reasoning=triage_result.get("reasoning", "No reasoning provided")
                    ))
                    incident = await session.get(IncidentDB, incident_id)
                    if incident:
                        incident.severity = triage_result.get("severity", "UNKNOWN")
                        incident.status = "triaged"
                    await session.commit()

                logger.info("[PIPELINE] Stage 2: Log Analyst Agent")
                log_input = raw_logs if raw_logs else alert_text
                log_result = await loop.run_in_executor(None, run_log_analysis, log_input)
                logger.info(f"[PIPELINE] Log Analysis Complete: {json.dumps(log_result, indent=2)}")

                async with AsyncSessionLocal() as session:
                    session.add(AgentLogDB(
                        incident_id=incident_id,
                        agent_name="Log Analyst Agent",
                        action=log_result.get("error_type", "UNKNOWN"),
                        reasoning=log_result.get("root_cause", "No root cause identified")
                    ))
                    await session.commit()

                logger.info("[PIPELINE] Stage 3: Correlator Agent")
                correlation_input = concurrent_alerts if concurrent_alerts else [alert_text]
                correlation_result = await loop.run_in_executor(None, run_correlation, correlation_input)
                logger.info(f"[PIPELINE] Correlation Complete: {json.dumps(correlation_result, indent=2)}")

                async with AsyncSessionLocal() as session:
                    session.add(AgentLogDB(
                        incident_id=incident_id,
                        agent_name="Correlator Agent",
                        action=f"Related: {correlation_result.get('is_related', False)}",
                        reasoning=correlation_result.get("primary_cause", "No correlation found")
                    ))
                    await session.commit()

                incident_context = (
                    f"Triage: {json.dumps(triage_result)}\n"
                    f"Log Analysis: {json.dumps(log_result)}\n"
                    f"Correlation: {json.dumps(correlation_result)}\n"
                    f"Original Alert: {alert_text}"
                )

                logger.info("[PIPELINE] Stage 4: Fixer Agent (MCP Tools)")
                fixer_result = await loop.run_in_executor(None, run_fixer, incident_context)
                logger.info(f"[PIPELINE] Fixer Complete: {json.dumps(fixer_result, indent=2)}")

                async with AsyncSessionLocal() as session:
                    session.add(AgentLogDB(
                        incident_id=incident_id,
                        agent_name="Fixer Agent",
                        action=json.dumps(fixer_result.get("action_plan", [])),
                        reasoning=f"Risk: {fixer_result.get('risk_level', 'UNKNOWN')} | Human Approval: {fixer_result.get('requires_human_approval', True)}"
                    ))
                    incident = await session.get(IncidentDB, incident_id)
                    if incident:
                        incident.status = "resolved" if not fixer_result.get("requires_human_approval") else "pending_approval"
                    await session.commit()

                await add_incident_resolution_to_memory(
                    incident_id,
                    title,
                    triage_result.get("reasoning", "") + " | " + log_result.get("root_cause", ""),
                    json.dumps(fixer_result.get("action_plan", []))
                )

                logger.info(f"[PIPELINE] Incident #{incident_id} fully processed through all 4 agents.")

            except Exception as e:
                logger.error(f"[PIPELINE ERROR] Failed to process alert: {str(e)}")

    except asyncio.CancelledError:
        logger.info("[KAFKA CONSUMER] Stopping...")
    finally:
        await consumer.stop()
        logger.info("[KAFKA CONSUMER] Stopped.")
