import os
from pathlib import Path


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret-change-me")
    JWT_ACCESS_TOKEN_EXPIRES = False  # match SPA expectations; tighten in production
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        # Defaulting to PostgreSQL template for development transition
        "postgresql://postgres:postgres@localhost:5432/the_clubs",
    )
    _origins = os.environ.get(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )
    CORS_ORIGINS = [o.strip() for o in _origins.split(",") if o.strip()]
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB uploads
