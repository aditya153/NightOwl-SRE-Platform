import json
import asyncio
import logging
from aiokafka import AIOKafkaConsumer
import os

from agents.triage import triage_agent, triage_task
from crewai import Crew, Process

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
            
            # Trigger the AI Triage Agent
            logger.info("[AGENT GATEWAY] Waking up Triage Agent...")
            try:
                crew = Crew(
                    agents=[triage_agent],
                    tasks=[triage_task],
                    process=Process.sequential,
                    verbose=True
                )
                
                # We offload the synchronous CrewAI execution to a thread to not block the async Kafka loop
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    None, 
                    crew.kickoff, 
                    {"alert_payload": json.dumps(alert_data)}
                )
                
                logger.info(f"[AGENT SUMMARY] Triage Complete:\n{result}")
            except Exception as e:
                logger.error(f"[AGENT ERROR] Failed to triage alert: {str(e)}")
                
    except asyncio.CancelledError:
        logger.info("[KAFKA CONSUMER] Stopping...")
    finally:
        await consumer.stop()
        logger.info("[KAFKA CONSUMER] Stopped.")
