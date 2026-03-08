"""
NightOwl — Environment Configuration
=====================================
Loads settings from .env file using Pydantic.
Why Pydantic for config? Because it validates env vars at startup.
If something is missing, the app crashes immediately with a clear error
instead of failing randomly later in production.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """
    All environment variables in one place.
    
    How it works:
    - Reads from .env file automatically
    - If a variable has a default value, it's optional
    - If no default, the app won't start without it
    - Validates types (str stays str, int stays int)
    """

    # ── App Settings ────────────────────────────────
    APP_NAME: str = "NightOwl Agent Gateway"
    API_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"      # development | staging | production
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"               # DEBUG | INFO | WARNING | ERROR

    # ── Server ──────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ── CORS (which frontends can access this API) ──
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # ── Database (for later days) ───────────────────
    # DATABASE_URL: str = ""
    # REDIS_URL: str = ""

    # ── Kafka (for later days) ──────────────────────
    # KAFKA_BROKER: str = ""

    # ── AI / LLM (for later days) ───────────────────
    # OPENROUTER_API_KEY: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


# Single instance used across the app
settings = Settings()
