from mcp.server.fastmcp import FastMCP
import subprocess
import os

mcp = FastMCP("Kubernetes")

if __name__ == "__main__":
    mcp.run(transport="stdio")
