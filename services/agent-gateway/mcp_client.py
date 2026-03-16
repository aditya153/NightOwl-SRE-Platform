import asyncio
from typing import Optional, Dict, Any, List, Type
from pydantic import BaseModel, create_model
from mcp.client.stdio import stdio_client, StdioServerParameters
from mcp.client.session import ClientSession
from crewai.tools import BaseTool

class MCPToolWrapper(BaseTool):
    """
    A CrewAI tool that dynamically acts as a proxy to an external MCP Tool.
    """
    name: str = ""
    description: str = ""
    args_schema: Optional[Type[BaseModel]] = None
    mcp_session: Any = None
    mcp_tool_name: str = ""

    def _run(self, **kwargs) -> Any:
        """Execute the tool synchronously by running the async MCP call in a loop."""
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
        result = loop.run_until_complete(
            self.mcp_session.call_tool(self.mcp_tool_name, arguments=kwargs)
        )
        return result.content if hasattr(result, "content") else str(result)

class AgentMCPClient:
    """
    A robust client that connects to an external MCP server via stdio,
    discovers its tools, and automatically binds them to CrewAI standard Tools.
    """
    def __init__(self, command: str, args: List[str]):
        self.server_params = StdioServerParameters(
            command=command,
            args=args,
            env=None
        )
        self.session: Optional[ClientSession] = None
        self._exit_stack = None

    async def connect(self):
        """Establish the standard IO connection to the MCP server."""
        from contextlib import AsyncExitStack
        self._exit_stack = AsyncExitStack()
        
        transport = await self._exit_stack.enter_async_context(
            stdio_client(self.server_params)
        )
        read, write = transport
        self.session = await self._exit_stack.enter_async_context(
            ClientSession(read, write)
        )
        await self.session.initialize()

    async def get_crewai_tools(self) -> List[BaseTool]:
        """Fetch all tools from the MCP server, generating Pydantic Schemas dynamically."""
        if not self.session:
            raise RuntimeError("Must connect to MCP server before fetching tools.")
            
        crew_tools = []
        result = await self.session.list_tools()
        
        for tool in result.tools:
            # 1. Define schema standards for how agents will invoke tools.
            # We map JSON Schema `properties` directly into Pydantic BaseModels 
            # so the Agent LLM knows exactly what arguments to provide.
            fields = {}
            if tool.inputSchema and "properties" in tool.inputSchema:
                for prop_name, prop_details in tool.inputSchema["properties"].items():
                    # Defaulting to strings, but keeping architecture flexible
                    fields[prop_name] = (str, ...)
                    
            dynamic_schema = create_model(f"{tool.name}Schema", **fields)
            
            wrapped_tool = MCPToolWrapper(
                name=tool.name,
                description=tool.description or f"Executes the {tool.name} tool.",
                args_schema=dynamic_schema,
                mcp_session=self.session,
                mcp_tool_name=tool.name
            )
            crew_tools.append(wrapped_tool)
            
        return crew_tools
        
    async def disconnect(self):
        """Close the connection cleanly."""
        if self._exit_stack:
            await self._exit_stack.aclose()
