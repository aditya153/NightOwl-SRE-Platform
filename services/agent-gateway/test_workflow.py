import json
from agents import run_full_incident_analysis

dummy_incident = "GRAFANA ALERT: Frontend API Timeout (504 Gateway Time-out) on https://api.nightowl.com/v1/checkout"

dummy_logs = """
2026-03-14 22:50:11 ERROR [api-gateway] TimeoutError: connection to Redis cache 10.0.4.155 refused.
    at RedisClient.connect (/app/node_modules/redis/client.js:45)
    at runMicrotasks (<anonymous>)
"""

dummy_concurrent_alerts = [
    "AWS ELASTICACHE: Redis node 10.0.4.155 CPU 100%, Evictions High",
    "SENTRY: 500 API Errors spiking across /v1/checkout and /v1/users"
]

if __name__ == "__main__":
    print("🚀 Starting FULL NightOwl Agentic Workflow (Triage -> Log Analyst -> Correlator)...\n")
    
    result = run_full_incident_analysis(dummy_incident, dummy_logs, dummy_concurrent_alerts)
    
    print("\n\n--- 🧠 FINAL CREWAI SEQUENTIAL OUTPUT (CORRELATOR) ---")
    
    # CrewAI's output might be raw JSON text, so let's try to parse it
    raw_text = result["final_analysis_raw"].strip()
    if raw_text.startswith("```json"):
        raw_text = raw_text.replace("```json\n", "").replace("\n```", "")
        
    try:
        parsed = json.loads(raw_text)
        print(json.dumps(parsed, indent=2))
    except Exception:
        print(raw_text)
