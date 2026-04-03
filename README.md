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

## What We've Built (Days 1-17)

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

### 11. GitHub MCP Tool Server
A second sandboxed MCP Server that allows agents to securely interact with GitHub's REST API. Exposes two approved tools: Create Pull Request and Create Issue Comment. The AI never sees the GitHub token directly.

### 12. Agent & Tool Synchronization
Rewired the Fixer Agent to dynamically discover and load tools from the Kubernetes and GitHub MCP Servers at runtime via the `AgentMCPClient`. The agent no longer uses hardcoded simulation tools. Includes a full integration test with realistic mock incident data (OOMKilled pod with cascading API failures).

### 13. Mid-point Review & End-to-End Pipeline
Wired the complete autonomous pipeline: Grafana Alert -> Kafka -> Triage Agent -> Log Analyst Agent -> Correlator Agent -> Fixer Agent (with live MCP tools). Every incoming Kafka alert now flows through all 4 agents sequentially with full database logging at each stage. Refactored duplicated code across all agents into a shared `agents/utils.py` utility module, eliminating ~22 lines of technical debt.

### 14. Frontend Dashboard (React + Vite + Tailwind CSS)
Initialized the NightOwl Dashboard as a React + Vite application with Tailwind CSS v4 and a custom dark theme design system (`owl-bg`, `owl-surface`, `owl-blue`, `owl-purple`, `owl-green`). Established the scalable folder structure: `pages/` (Dashboard, Incidents, Agents), `components/` (Sidebar), and `hooks/` (API data fetching). Configured Vite to proxy API requests to the FastAPI backend.

### 15. AI-Assisted UI Engineering & Master Incident List
Leveraged the external **Stitch MCP Server** to autonomously generate a "Big Tech" tier design system named *Obsidian Nocturnal*. Ported the raw HTML/Tailwind structural output directly into React components to build a highly dense, immersive Master Incident List. The layout features glassmorphism, functional TopNav search, data-rich Bento statistics (MTTR, Active Criticals), and a dynamically scalable grid system.

### 16. Incident Detail View & Agent Chat Stream
Built the interactive deep-dive view (`IncidentDetail.jsx`) for analyzing individual anomalies. The right-hand panel features an autonomous **Agent Action Stream**—a chronological terminal emulator that renders the live thoughts, logic, and actions of the Triage Bot, Log Analyst, Correlator, and Fixer agents with matrix-style glowing syntax. The left panel isolates the specific infrastructure nodes and explicitly visualizes the root cause for human validation before finalizing the remediation payload.

### 17. React Query & Live API Integration
Fully integrated `@tanstack/react-query` to bridge the React frontend with the FastAPI backend. Removed all static UI mocks and implemented dynamic `useIncidentsList` and `useIncidentDetails` hooks. The Dashboard now actively queries the Python gateway's PostgreSQL database for live infrastructure event metrics, maintaining globally cached states with elegant loading/error fallbacks styled into the Obsidian Nocturnal theme.

### 18. Real-time Connectivity (Socket.io)
Implemented a high-performance websocket stream using Socket.io between the Node.js Event Dispatcher and the React Dashboard. The frontend now features a "Live Stream Active" pulse indicator. When new incidents arrive via webhooks, the Event Dispatcher emits an event that instantly triggers a background refetch in the Dashboard via React Query, ensuring zero-latency visibility into infrastructure anomalies without manual page refreshes.

### 19. UI Polish, Responsive Design & Dark/Light Mode
Finalized the Obsidian Nocturnal design system with comprehensive micro-animations (staggered fade-ins, hover-lift, hover-glow, scale-in), full responsive support (Mobile, Tablet, Desktop) with collapsible sidebar and adaptive grids, and a dark/light mode toggle powered by a custom `ThemeContext` with `localStorage` persistence and 30+ CSS design token remappings.

### 20. CI/CD & Automated Linting Pipeline
Established a robust GitHub Actions workflow for Continuous Integration. On every push or PR, the cloud spins up an isolated Ubuntu runner to automatically test the `agent-gateway` with Flake8/pytest, and the `dashboard` with ESLint/npm build, ensuring zero broken code merges into the `main` branch.

### 21. Dockerized Containerization
Built optimized, multi-stage `Dockerfile` definitions for all microservices (Event Dispatcher, Agent Gateway, Dashboard). Configured the CI pipeline to automatically build and validate these images. The entire infrastructure can now be spun up consistently across any environment.

### 22. Autonomous Fix Pipeline (The "Self-Healing" CI)
Integrated Meta's Llama 3.3 70B model via NVIDIA NIMs as an autonomous CI/CD fixer. When the GitHub Actions pipeline crashes (e.g. syntax error, failed Docker build), NightOwl automatically extracts the failed logs and source files, and triggers the LLM. The AI writes a fix, and automatically opens a Pull Request back to the repository.

### 23. OWASP Safety Engine
Since LLMs can hallucinate destructive commands or lazy shortcuts, we built a deterministic Python guardrail system. Before any AI code is merged, the `OWASP-CONFIG-001` engine strictly scans the payload. If the AI attempts to rewrite a protected configuration file or execute forbidden shell logic, the pipeline is physically blocked.

### 24. Chain of Thought Constraint (Day 30 Finale)
To prevent the LLM from blindly guessing solutions, we enforced a strict JSON schema limitation on the LLM prompt. Before generating any code, the AI is physically required to output an `analysis` block detailing the step-by-step root cause. This "Chain of Thought" architecture forces the model to reason correctly before proposing a fix.

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
