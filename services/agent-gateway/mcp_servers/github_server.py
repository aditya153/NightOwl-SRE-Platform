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

if __name__ == "__main__":
    mcp.run(transport="stdio")
