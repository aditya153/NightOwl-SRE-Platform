from crewai.tools import tool

@tool("Restart Kubernetes Pod")
def restart_kubernetes_pod(pod_name: str, namespace: str = "default") -> str:
    """
    Simulates restarting a stateless Kubernetes pod.
    This is considered a safe, low-risk action.
    """
    return f"Successfully issued rollout restart for pod {pod_name} in namespace {namespace}."

@tool("Clear Redis Cache")
def clear_redis_cache() -> str:
    """
    Simulates sending a FLUSHALL command to the Redis caching layer.
    This is considered a safe, low-risk action for transient data.
    """
    return "Successfully cleared Redis cache. Memory freed."

@tool("Rollback Deployment")
def rollback_deployment(deployment_name: str, revision: int) -> str:
    """
    Simulates rolling back a Kubernetes deployment to a previous revision.
    This is a HIGH RISK action that requires human approval.
    """
    return f"Prepared rollback for {deployment_name} to revision {revision}. PENDING HUMAN APPROVAL."

@tool("Scale Up Replicas")
def scale_up_replicas(deployment_name: str, current_replicas: int, new_replicas: int) -> str:
    """
    Simulates increasing the replica count for a deployment under heavy load.
    Considered medium/low risk depending on infrastructure capacity.
    """
    return f"Scaled {deployment_name} from {current_replicas} to {new_replicas} replicas.
