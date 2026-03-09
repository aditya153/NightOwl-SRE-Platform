# Agent Gateway

The central API service for the NightOwl platform. Receives incidents, validates data, routes to AI agents, and exposes the Triage Agent for alert classification.

## Setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Add your OpenRouter API key to `.env`.

## Run

```bash
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

Open `http://localhost:8000/docs` for the Swagger UI.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| GET | / | Service info |
| POST | /api/v1/incidents | Create incident |
| GET | /api/v1/incidents | List incidents |
| GET | /api/v1/agents | List AI agents |
| POST | /api/v1/triage | Triage an alert using AI |
