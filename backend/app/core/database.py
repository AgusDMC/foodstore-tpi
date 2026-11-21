from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, echo=False)


def create_all_tables() -> None:
    # Crea las tablas de los modelos importados que todavia no existen
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    # expire_on_commit=False: los objetos siguen legibles despues del commit
    return Session(engine, expire_on_commit=False)
