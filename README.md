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

## 30-Day Engineering Architecture

### Phase 1: Ingestion & Routing (Days 1-10)
Engineered the core foundation of the autonomous pipeline. 
- Designed a high-speed Express.js (Node.js) Event Dispatcher to capture real-time Grafana webhooks and GitHub events. 
- Integrated Apache Kafka and Zookeeper via Docker to decouple ingestion. The Node.js provider publishes payloads asynchronously, while the Python gateway consumes them seamlessly using `aiokafka`.
- Established the central API Gateway using FastAPI, utilizing Pydantic models for strict payload validation. 

### Phase 2: Autonomous Diagnostic Agents (Days 11-20)
Implemented the multi-agent reasoning architecture using CrewAI and OpenRouter (Gemini / LLaMA).
- Developed the Triage Agent to classify infrastructure severity automatically.
- Engineered a Log Analyst Agent capable of parsing raw Java/Python stack traces, extracting precise root causes while dropping framework noise.
- Deployed a local Qdrant Vector Database. Embedded historical incident resolutions using `sentence-transformers` for zero-latency RAG semantic search.
- Created the interactive React/Vite dashboard. Built a glassmorphic design system to render autonomous agent reasoning and infrastructure events through a live Socket.io websocket stream.

### Phase 3: The Self-Healing Infrastructure (Days 21-30)
Transformed the diagnostic platform into an active remediation engine capable of modifying its own source code and infrastructure.
- Deployed Anthropic's Model Context Protocol (MCP) in a sandboxed Tool Server layout. Decoupled the AI "Brain" from the "Hands" to ensure absolute security when executing commands on Kubernetes or GitHub.
- Configured isolated CI/CD pipelines via GitHub Actions, implementing automated linting (Flake8) and multi-stage Docker builds.
- Built the "AutoFix Pipeline" backed by Meta's Llama 3.3 70B model. Configured the AI to automatically detect failed GitHub Actions logs and issue Pull Requests with the correct code.
- Engineered a proprietary OWASP Safety Engine (`OWASP-CONFIG-001`). This strictly deterministic Python guardrail system physically blocks the LLM from generating or modifying environment, configuration, or structural build files, entirely neutralizing AI hallucinations.
- Implemented a Forced JSON "Chain of Thought" architecture. AI agents are structurally restricted from proposing code until they map their logic sequentially through an `analysis` JSON field, guaranteeing verifiable precision before codebase interaction.

## Setup Instructions for Contributors

Welcome to the open-source NightOwl project. Please follow these steps to securely spin up the infrastructure for local development.

### Prerequisites
- Docker and Docker Compose installed.
- Python 3.11+
- Node.js v22+
- Valid API keys for OpenRouter and NVIDIA NIM.

### Local Infrastructure Setup

1. **Clone the repository:**
```bash
git clone https://github.com/aditya153/NightOwl-SRE-Platform.git
cd NightOwl-SRE-Platform
```

2. **Configure Environment Variables:**
You must configure the required `.env` files for the microservices.
```bash
cp services/agent-gateway/.env.example services/agent-gateway/.env
cp services/event-dispatcher/.env.example services/event-dispatcher/.env
```
Ensure you paste your respective API keys inside `services/agent-gateway/.env`.

3. **Boot the Dependencies:**
Launch the underlying Kafka broker, Zookeeper, PostgreSQL, and Qdrant databases via Docker.
```bash
docker-compose up -d zookeeper kafka postgres qdrant
```

4. **Initialize the Agent Gateway (Python):**
```bash
cd services/agent-gateway
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

5. **Initialize the Event Dispatcher (Node.js):**
Open a new terminal.
```bash
cd services/event-dispatcher
npm ci
npm run dev
```

6. **Start the Frontend Dashboard (React):**
Open a new terminal.
```bash
cd services/dashboard
npm ci
npm run dev
```
The dashboard will be available at `http://localhost:5173`.

## Architecture Principles
NightOwl is built on a "Platform-over-Prompt" philosophy. We assume AI models will occasionally hallucinate; therefore, the reliability of the platform is guaranteed by deterministic engineering (Schema Validation, OWASP Scanners, Human-in-the-Loop circuit breakers) rather than prompt engineering alone.

## License

This project is licensed under the MIT License.
