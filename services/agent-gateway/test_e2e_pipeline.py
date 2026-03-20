import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agents.triage import run_triage
from agents.log_analyst import run_log_analysis
from agents.correlator import run_correlation
from agents.fixer import run_fixer

MOCK_GRAFANA_ALERT = """
Source: Grafana
Alert Name: High Memory Usage on payment-service
State: alerting
Message: payment-service pod memory usage exceeded 95% threshold (512Mi limit). 
Pod has been OOMKilled twice in the last 30 minutes.
Dashboard URL: http://grafana.internal/d/k8s-pods/overview
"""

MOCK_STACK_TRACE = """
java.lang.OutOfMemoryError: Java heap space
    at com.nightowl.payment.handlers.TransactionHandler.processQueue(TransactionHandler.java:142)
    at com.nightowl.payment.handlers.TransactionHandler.handleBatch(TransactionHandler.java:89)
    at com.nightowl.payment.core.PaymentEngine.execute(PaymentEngine.java:201)
    at org.springframework.scheduling.concurrent.ConcurrentTaskScheduler.run(ConcurrentTaskScheduler.java:175)
    at java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1136)

Caused by: com.nightowl.payment.exceptions.BatchOverflowException: Transaction batch size exceeded maximum allocation
    at com.nightowl.payment.handlers.TransactionHandler.validateBatch(TransactionHandler.java:156)
"""

MOCK_CONCURRENT_ALERTS = [
    "API Gateway returning HTTP 502 for /api/payments endpoint. 47 failed requests in last 5 minutes.",
    "Kafka consumer lag increasing on payment-events topic. Current lag: 12,847 messages.",
    "Frontend timeout errors reported by users on checkout page. Average response time: 32 seconds."
]

def print_section(title):
    print()
    print("=" * 70)
    print(f"  {title}")
    print("=" * 70)
    print()

def main():
    print_section("NIGHTOWL END-TO-END PIPELINE TEST (Day 15 Mid-Point Review)")

    print_section("STAGE 1: TRIAGE AGENT")
    print("Input: Raw Grafana alert")
    print("-" * 40)
    triage_result = run_triage(MOCK_GRAFANA_ALERT)
    print("Triage Output:")
    print(json.dumps(triage_result, indent=2))

    print_section("STAGE 2: LOG ANALYST AGENT")
    print("Input: Raw Java stack trace")
    print("-" * 40)
    log_result = run_log_analysis(MOCK_STACK_TRACE)
    print("Log Analysis Output:")
    print(json.dumps(log_result, indent=2))

    print_section("STAGE 3: CORRELATOR AGENT")
    print("Input: 3 concurrent alerts")
    print("-" * 40)
    correlation_result = run_correlation(MOCK_CONCURRENT_ALERTS)
    print("Correlation Output:")
    print(json.dumps(correlation_result, indent=2))

    incident_context = (
        f"Triage Assessment: {json.dumps(triage_result)}\n"
        f"Log Analysis: {json.dumps(log_result)}\n"
        f"Correlation: {json.dumps(correlation_result)}\n"
        f"Original Alert: {MOCK_GRAFANA_ALERT}"
    )

    print_section("STAGE 4: FIXER AGENT (with live MCP Tools)")
    print("Input: Combined output from all previous agents")
    print("-" * 40)
    fixer_result = run_fixer(incident_context)
    print("Fixer Output:")
    print(json.dumps(fixer_result, indent=2))

    print_section("FINAL PIPELINE SUMMARY")
    print(f"Triage Severity:          {triage_result.get('severity', 'N/A')}")
    print(f"Triage Action:            {triage_result.get('action', 'N/A')}")
    print(f"Log Root Cause:           {log_result.get('root_cause', 'N/A')}")
    print(f"Log Culprit File:         {log_result.get('culprit_file', 'N/A')}")
    print(f"Alerts Correlated:        {correlation_result.get('is_related', 'N/A')}")
    print(f"Correlation Confidence:   {correlation_result.get('confidence', 'N/A')}")
    print(f"Fixer Risk Level:         {fixer_result.get('risk_level', 'N/A')}")
    print(f"Human Approval Required:  {fixer_result.get('requires_human_approval', 'N/A')}")
    print(f"Action Plan:              {fixer_result.get('action_plan', 'N/A')}")
    print()

    if fixer_result.get("requires_human_approval"):
        print("VERDICT: HUMAN APPROVAL REQUIRED - Agent paused for engineer sign-off.")
    else:
        print("VERDICT: AUTO-APPROVED - Agent executed the fix autonomously.")

    print()
    print("=" * 70)
    print("  END-TO-END TEST COMPLETE")
    print("=" * 70)

if __name__ == "__main__":
    main()
