import os
import httpx
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("GitHub")

GITHUB_API_URL = "https://api.github.com"

def get_github_headers() -> dict:
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        raise ValueError("GITHUB_TOKEN environment variable is required")
    return {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": f"Bearer {token}",
        "User-Agent": "NightOwl-Agent"
    }

@mcp.tool()
def create_pull_request(owner: str, repo: str, title: str, body: str, head: str, base: str) -> str:
    headers = get_github_headers()
    url = f"{GITHUB_API_URL}/repos/{owner}/{repo}/pulls"
    data = {"title": title, "body": body, "head": head, "base": base}
    
    with httpx.Client() as client:
        response = client.post(url, headers=headers, json=data)
        
    if response.status_code == 201:
        pr_data = response.json()
        return f"Successfully created PR #{pr_data.get('number')}: {pr_data.get('html_url')}"
    else:
        return f"Failed to create PR. Status: {response.status_code}, Error: {response.text}"

if __name__ == "__main__":
    mcp.run(transport="stdio")
