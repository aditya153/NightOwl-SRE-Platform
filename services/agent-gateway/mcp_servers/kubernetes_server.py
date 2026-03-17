from mcp.server.fastmcp import FastMCP
import subprocess
import os

mcp = FastMCP("Kubernetes")

@mcp.tool()
def restart_pod(namespace: str, pod_name: str) -> str:
    try:
        result = subprocess.run(
            ["kubectl", "delete", "pod", pod_name, "-n", namespace],
            capture_output=True,
            text=True,
            check=True
        )
        return f"Successfully restarted pod {pod_name} in namespace {namespace}. Output: {result.stdout}"
    except subprocess.CalledProcessError as e:
        return f"Failed to restart pod {pod_name}: {e.stderr}"

@mcp.tool()
def scale_deployment(namespace: str, deployment_name: str, replicas: int) -> str:
    try:
        result = subprocess.run(
            ["kubectl", "scale", f"deployment/{deployment_name}", f"--replicas={replicas}", "-n", namespace],
            capture_output=True,
            text=True,
            check=True
        )
        return f"Successfully scaled deployment {deployment_name} to {replicas} replicas. Output: {result.stdout}"
    except subprocess.CalledProcessError as e:
        return f"Failed to scale deployment {deployment_name}: {e.stderr}"

if __name__ == "__main__":
    mcp.run(transport="stdio")
