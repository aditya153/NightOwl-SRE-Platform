import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agents.fixer import run_fixer

MOCK_INCIDENT = """
INCIDENT REPORT:
- Title: payment-service pod OOMKilled in production namespace
- Severity: CRITICAL
- Priority: 1
- Root Cause: The payment-service pod exceeded its memory limit of 512Mi due to a memory leak in the transaction handler. The Kubernetes OOM killer terminated the pod.
- Error Type: OutOfMemoryError
- Culprit File: services/payment-service/src/handlers/transaction.py
- Affected Component: payment-service
- Correlation: 3 concurrent alerts (API gateway 502 errors + payment timeout alerts) all traced back to this single pod failure.
- Recommended Action: RESTART the payment-service pod in the production namespace to restore service immediately. Then SCALE the deployment to 3 replicas to handle the backlog of queued transactions.
"""

def main():
    print("=" * 60)
    print("DAY 14: FIXER AGENT + MCP TOOL INTEGRATION TEST")
    print("=" * 60)
    print()
    print("MOCK INCIDENT DATA:")
    print("-" * 40)
    print(MOCK_INCIDENT)
    print("-" * 40)
    print()
    print("Launching Fixer Agent with live MCP tools...")
    print()

    result = run_fixer(MOCK_INCIDENT)

    print()
    print("=" * 60)
    print("FIXER AGENT RESULT:")
    print("=" * 60)
    print(json.dumps(result, indent=2))
    print()

    if result.get("requires_human_approval"):
        print("STATUS: HUMAN APPROVAL REQUIRED - Agent is waiting for engineer sign-off.")
    else:
        print("STATUS: AUTO-APPROVED - Agent executed the fix autonomously.")

if __name__ == "__main__":
    main()
