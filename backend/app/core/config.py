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

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
