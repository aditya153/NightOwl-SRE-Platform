import json
from crewai import Crew, Process, Task
from .triage import triage_agent
from .log_analyst import log_analyst_agent
from .correlator import correlator_agent

def run_full_incident_analysis(incident_alert: str, related_logs: str, concurrent_alerts: list[str]) -> dict:
    """
    Executes a multi-agent sequential workflow.
    1. Triage Agent determines base severity.
    2. Log Analyst parses the raw logs.
    3. Correlator cross-references with concurrent alerts.
    """
    
    # Task 1: Triage
    task_triage = Task(
        description=f"Analyze this alert: {incident_alert}\nDetermine its severity and priority.",
        expected_output="A JSON object containing severity, priority, action, and reasoning.",
        agent=triage_agent
    )
    
    # Task 2: Log Analysis
    task_log_analysis = Task(
        description=f"Parse these logs: {related_logs}\nDetermine the exact root cause and culprit file.",
        expected_output="A strict JSON object with error_type, root_cause, culprit_file, and affected_component.",
        agent=log_analyst_agent
    )
    
    # Task 3: Correlation
    alerts_text = "\n".join(concurrent_alerts)
    task_correlation = Task(
        description=f"Review the findings from the previous agents along with these concurrent alerts: {alerts_text}\nDetermine if they are related.",
        expected_output="A JSON object indicating if alerts are related, the primary cause, and confidence level.",
        agent=correlator_agent
    )
    
    # Execute the Crew Sequentially
    crew = Crew(
        agents=[triage_agent, log_analyst_agent, correlator_agent],
        tasks=[task_triage, task_log_analysis, task_correlation],
        process=Process.sequential,
        verbose=False
    )
    
    # The final output of sequential process is the output of the Correlator
    result = crew.kickoff()
    
    return {
        "final_analysis_raw": result.raw
    }
