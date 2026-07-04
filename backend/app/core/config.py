from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str
    GEMINI_API_KEY: str
    GROQ_API_KEY: str
    SLACK_WEBHOOK_URL: Optional[str] = None

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
