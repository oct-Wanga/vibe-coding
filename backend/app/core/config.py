from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "FSD FastAPI"
    app_env: str = "development"
    api_prefix: str = "/api"
    cors_allowed_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    session_store_backend: str = "redis"
    redis_url: str = "redis://localhost:6379/0"
    session_ttl_seconds: int = 60 * 60 * 24

    session_cookie_name: str = "session_token"
    session_cookie_secure: bool = False
    session_cookie_httponly: bool = True
    session_cookie_samesite: str = "lax"
    session_single_login: bool = True
    login_rate_limit_max_attempts: int = 5
    login_rate_limit_window_seconds: int = 60

    supabase_url: str | None = None
    supabase_service_role_key: str | None = None

    outbox_enabled: bool = True
    outbox_relay_enabled: bool = False
    outbox_relay_poll_interval_seconds: float = 1.0
    outbox_relay_batch_size: int = 100
    outbox_relay_max_attempts: int = 10
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_projects_created_topic: str = "projects.project-created.v1"
    kafka_client_id: str = "fastapi-outbox-relay"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
