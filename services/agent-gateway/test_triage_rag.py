import json
from agents.triage import run_triage

def test_triage_rag():
    print("--- Testing Triage Agent with RAG Context ---")
    
    alert = "The API Gateway pod just died and is restarting. Looks like OOMKilled. We are seeing 502 errors."
    print(f"\nIncoming Alert: {alert}")
    
    print("\nRunning Triage Agent... (This uses the LLM and the Vector DB)")
    result = run_triage(alert)
    
    print("\n--- Final Triage Decision ---")
    print(json.dumps(result, indent=2))
    
    # Simple assertion
    if "SCALE_UP" in result.get("action", "") or "ROLLBACK" in result.get("action", ""):
        print("\n✅ Verification SUCCESS: Triage agent chose an action based on the historical playbook!")
    else:
        print("\n❌ Verification FAILED: Triage agent ignored the playbook recommendations (Expected SCALE_UP or ROLLBACK).")

if __name__ == "__main__":
    test_triage_rag()
