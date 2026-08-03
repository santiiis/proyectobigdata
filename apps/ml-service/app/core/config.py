"""
Core configuration — Pydantic Settings

Loads environment variables for the ML service.
Spec: Sección 4.5 — Comunicación interna via API Key
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """ML Service configuration loaded from environment variables."""

    # API Security
    ML_API_KEY: str = "ml-api-key-cambiar-en-produccion"

    # Database (read-only access for batch pipelines)
    DATABASE_URL: str = "mysql+pymysql://desercion_user:desercion_pass@localhost:3306/desercion_db"

    # Web app origin for CORS
    WEB_ORIGIN: str = "http://localhost:3000"

    # Model settings
    MODEL_PATH: str = "app/models"
    MODEL_VERSION: str = "0.1.0"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
