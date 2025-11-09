from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import StaticPool
from config import Settings

settings = Settings()

if settings.database_url.startswith("sqlite"):
    engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=settings.debug
    )
else:
    engine = create_engine(settings.database_url, echo=settings.debug)

Base = declarative_base()
