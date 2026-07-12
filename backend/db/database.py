"""
Database engine, session factory, and Base for SQLAlchemy ORM.
"""
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from ..config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    """Dependency — yields a DB session and ensures closure."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def apply_extra_sql() -> None:
    """Applies Postgres-specific partial unique indexes not expressible via SQLAlchemy models."""
    sql_path = Path(__file__).parent / "migrations_extra.sql"
    if not sql_path.exists():
        return
    with engine.begin() as conn:
        for statement in sql_path.read_text().split(";"):
            statement = statement.strip()
            if statement:
                conn.execute(text(statement))