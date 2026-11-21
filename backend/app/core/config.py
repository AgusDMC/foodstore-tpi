from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# .env de la carpeta backend/, sin importar desde donde se ejecute
ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ENV_FILE, extra="ignore")

    # Sin valor por defecto: si falta en el .env la app no arranca
    DATABASE_URL: str
    SECRET_KEY: str = Field(min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # Solo los usa el seed
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str | None = None


settings = Settings()
