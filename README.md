# NightOwl — Autonomous SRE Platform

> AI-powered platform that detects, diagnoses, fixes, and documents infrastructure incidents automatically using multi-agent orchestration.

## Architecture

![NightOwl Architecture](docs/diagrams/architecture.gif)

> [View Full Interactive Diagram](https://aditya153.github.io/NightOwl-SRE-Platform/docs/diagrams/architecture-animated.html)

## Tech Stack

| Layer | Technology |
|-------|------------|
| AI Gateway | FastAPI + CrewAI + LangChain |
| Event Handler | Node.js + Express + Socket.io |
| LLM | OpenRouter (Gemini 2.0 Flash) |
| Tools | MCP Protocol (Model Context Protocol) |
| Queue | Apache Kafka |
| Cache | Redis |
| Database | PostgreSQL |
| Vector DB | Qdrant |
| Frontend | React + Vite |
| Monitoring | Prometheus + Grafana |
| Container | Docker + Kubernetes |

## How It Works

1. **Event Sources** (GitHub, Grafana, Kubernetes, Slack) emit events
2. **Event Dispatcher** validates, normalizes, and publishes events to Kafka
3. **Agent Gateway** consumes events and orchestrates AI agents via CrewAI
4. **AI Agents** (Triage, Log Analyst, Correlator, Fixer, Security, Compliance) analyze and resolve incidents
5. **MCP Tool Server** provides standardized tool access to infrastructure (K8s, GitHub, Prometheus, etc.)

## What's Built So Far

### Agent Gateway (`services/agent-gateway`)
The central API service built with FastAPI. Handles incoming incidents, validates data using Pydantic models, and routes alerts to the right AI agents.

**Key features:**
- REST API with 6 endpoints (health, incidents, agents, triage)
- Pydantic models for data validation (Severity, IncidentType, AgentStatus enums)
- Configuration management via environment variables
- CORS middleware for frontend integration
- Smart agent routing based on incident type

### Triage Agent (`services/agent-gateway/agents/triage.py`)
The first AI agent built with CrewAI and connected to Gemini 2.0 Flash via OpenRouter. It receives a raw alert text and returns a structured JSON response with severity, priority, recommended action, and reasoning.

**Example:**
```
Input:  "High CPU usage on api-server at 95%"
Output: { severity: MEDIUM, priority: 2, action: INVESTIGATE, reasoning: "..." }
```

## Development Progress

- [x] Phase 1: Architecture & Documentation
- [x] Phase 2: Agent Gateway (FastAPI + CrewAI + Triage Agent)
- [ ] Phase 3: Event Dispatcher (Node.js)
- [ ] Phase 4: MCP Tool Server
- [ ] Phase 5: AI Agents
- [ ] Phase 6: Frontend Dashboard
- [ ] Phase 7: Observability & Monitoring
- [ ] Phase 8: CI/CD & Deployment

## Getting Started

```bash
git clone https://github.com/aditya153/NightOwl-SRE-Platform.git
cd NightOwl-SRE-Platform/services/agent-gateway
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file with your OpenRouter API key, then run:

```bash
uvicorn main:app --reload --port 8000
```

Open `http://localhost:8000/docs` for the Swagger UI.

> Project is actively being built in public. Follow the journey on [LinkedIn](https://linkedin.com).

## License

MIT
