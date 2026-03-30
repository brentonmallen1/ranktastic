from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Server
    port: int = 8000
    base_url: str = "http://localhost:8080"

    # Database
    data_path: str = "./data"

    @property
    def database_url(self) -> str:
        return f"sqlite+aiosqlite:///{self.data_path}/ranktastic.db"

    # Auth
    secret_key: str = "change-me-to-a-random-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 8  # 8 hours

    # Admin (used for first-run setup)
    admin_username: str = "admin"
    admin_password: str = "changeme"

    # Email
    email_enabled: bool = False
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "noreply@ranktastic.local"
    smtp_tls: bool = True

    # App
    allow_public_polls: bool = True


@lru_cache
def get_settings() -> Settings:
    return Settings()
