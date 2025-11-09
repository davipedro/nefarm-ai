from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    database_url: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./nefarm.db"  # Default to SQLite for local development
    )
    pmc_service_url: str = os.getenv("PMC_SERVICE_URL", "http://localhost:8001")
    ia_service_url: str = os.getenv("IA_SERVICE_URL", "http://localhost:8002")
    browser_service_url: str = os.getenv("BROWSER_SERVICE_URL", "http://localhost:8003")
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = os.getenv("DEBUG", "true").lower() == "true"

    class Config:
        env_file = ".env"
