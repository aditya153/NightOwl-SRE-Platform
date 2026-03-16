# Model Context Protocol (MCP) Architecture in NightOwl

The NightOwl SRE Platform utilizes the open-source **Model Context Protocol (MCP)** to provide AI agents with standardized, secure access to infrastructure tools.

## The Problem with Hardcoded Tools
Previously, the "Fixer" agent carried out actions using raw Python functions embedded directly within the AI application (e.g., `tools.py`). In a production SRE setting, giving an AI direct runtime access to Kubernetes clusters, databases, and GitHub repositories is a significant security vulnerability. Hardcoded tools:
- Cannot be easily rate-limited or audited independently from the AI runtime.
- Require giving broad, sweeping IAM execution permissions to the core AI instance.
- Cannot be shared easily across different agent frameworks or microservices.

## The MCP Solution
Model Context Protocol introduces a strict Client-Server architecture between the AI's "Brain" and the Infrastructure's "Hands":

1. **Agent Gateway (Client)**: The `mcp_client.py` wrapper uses CrewAI to dynamically query an external MCP Server about what tools it has available. 
2. **Standardized Schema**: The Server responds using the standardized JSON Schema syntax defining exactly what parameters are required to run a specific tool (`cluster_name`, `namespace`, etc.). The client automatically generates structured Pydantic models mapping to this schema.
3. **Tool Servers (Hands)**: We run entirely separate microservices (e.g., `mcp_servers/kubernetes`) wrapped with their own strict permission boundaries. The Agent Gateway never holds a Kubernetes API token directly. Instead, it sends an MCP JSON-RPC execution request to the Kubernetes MCP Server, which securely executes the action on the cluster and returns the result.

By implementing MCP, the NightOwl agents gain a standardized, infinitely scalable, and highly secure mechanism to remediate production incidents autonomously.
