import json
from agents import run_correlation

dummy_alert_storm = [
    "ALERT 1: GRAFANA - High CPU Usage (100%) on database-primary-node-1 for 5 minutes.",
    "ALERT 2: AWS CLOUDWATCH - ConnectionTimeoutError from api-gateway to database-primary-cluster.",
    "ALERT 3: SENTRY - Python App 500 Internal Server Error: psycopg2.OperationalError: server closed the connection unexpectedly."
]

if __name__ == "__main__":
    print("Sending Alert Storm to CrewAI Correlator Agent...\n")
    print(f"Alerts to process: {len(dummy_alert_storm)}")
    for i, alert in enumerate(dummy_alert_storm):
        print(f"  {i+1}. {alert}")
    
    result = run_correlation(dummy_alert_storm)
    
    print("\n\n--- 🧠 CORRELATOR DECISION ---")
    print(json.dumps(result, indent=2))
