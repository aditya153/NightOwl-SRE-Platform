import json
from vector_db import search_runbooks

def test_rag_search():
    print("\n--- RAG Similarity Search Test ---\n")
    
    mock_alerts = [
        "The API Gateway pod just died and restarting. Looks like OOMKilled.",
        "Experiencing huge latency. Application logs say 'FATAL: sorry, too many clients already'",
        "Cache reads are super slow, Redis CPU at 99%, timeout everywhere."
    ]
    
    for alert in mock_alerts:
        print(f"QUERY ALERT: {alert}")
        
        results = search_runbooks(alert, limit=1)
        
        if results:
            best_match = results[0]
            print(f"-> MATCHED PLAYBOOK: {best_match['title']} (Score: {best_match['score']:.4f})")
            print(f"-> RCA: {best_match['root_cause_analysis']}")
            print(f"-> STEPS: {best_match['resolution_steps'][:2]}...\n")
        else:
            print("-> MATCHED PLAYBOOK: None found.\n")

if __name__ == "__main__":
    test_rag_search()
