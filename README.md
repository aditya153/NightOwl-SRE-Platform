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

## What We've Built (Days 1-12)

### 1. The API Gateway (FastAPI)
The central "Brain" service built with FastAPI. Handles incoming Kafka events, validates data using Pydantic models, and routes alerts to the right AI agents.
- REST API with structured endpoints and CORS middleware.
- Pydantic models for data validation (Severity, IncidentType, AgentStatus enums).

### 2. The Event Dispatcher (Node.js)
The "Ears" of the platform. A lightning-fast Express.js webhook receiver that instantly accepts payloads from GitHub or Grafana and pushes them to our message broker.

### 3. The Nervous System (Apache Kafka)
Integrated Apache Kafka + Zookeeper to decouple event ingestion from AI processing. The Node.js service acts as the Producer, and the Python service acts as the asynchronous Consumer via `aiokafka`.

### 4. The Filing Cabinet (PostgreSQL)
Set up a relational persistence layer using PostgreSQL via Docker Compose. Implemented SQLAlchemy ORM models (Incidents and Agent Logs) and Alembic for automated database migrations. All Kafka events are now saved permanently.

### 5. Long-term AI Memory (Qdrant Vector DB + RAG)
Deployed a Qdrant Vector Database to allow the AI to search for historical incident resolutions. We use local HuggingFace embeddings (`sentence-transformers`) via LangChain to convert agent reasoning into 384-dimensional mathematical arrays for zero-latency semantic search.

### 6. The Triage Agent
Our first CrewAI agent. Uses OpenRouter (Gemini 2.0 Flash) to parse raw infrastructure alerts and output a strict JSON classification: Severity, Priority, Action, and Reasoning.

### 7. The Log Analyst Agent
Our second CrewAI agent. Designed specifically to parse noisy Java/Python stack traces, ignore the framework garbage, and extract the exact `root_cause`, `error_type`, and `culprit_file` that caused a server crash.

### 8. The Correlator & Fixer Agents
Sequential AI pipeline mapping raw alerts into Triage -> Log Analysis -> Correlation, capped off by a strict "Human-in-the-Loop" Fixer agent designed to evaluate risk before executing infrastructure commands.

### 9. Model Context Protocol (MCP) Foundation
Built an isolating Tool Server architecture using Anthropic's Model Context Protocol. The AI "Brain" is completely decoupled from the Infrastructure "Hands", ensuring zero direct API access and maximum security.

### 10. Kubernetes MCP Tool Server
A standalone, sandboxed Python MCP Server that exposes strictly approved functions (Restart Pod, Scale Deployment) to the Agent Gateway via standard JSON-RPC over `stdio`.

## Development Progress

- [x] Phase 1: Architecture & Documentation
- [x] Phase 2: Agent Gateway (FastAPI + CrewAI + Triage Agent)
- [x] Phase 3: Event Dispatcher (Node.js)
- [x] Phase 4: MCP Tool Server
- [ ] Phase 5: AI Agents
- [ ] Phase 6: Frontend Dashboard
- [ ] Phase 7: Observability & Monitoring
- [ ] Phase 8: CI/CD & Deployment

## Getting Started

```bash
git clone https://github.com/aditya153/NightOwl-SRE-Platform.git
cd NightOwl-SRE-Platform
python3 -m venv venv
source venv/bin/activate
pip install -r services/agent-gateway/requirements.txt
cd services/agent-gateway
```

Create a `services/agent-gateway/.env` file with your OpenRouter API key, then run:

```bash
uvicorn main:app --reload --port 8000
```

Open `http://localhost:8000/docs` for the Swagger UI.

> Project is actively being built in public. Follow the journey on [LinkedIn](https://linkedin.com).

## License

MIT
