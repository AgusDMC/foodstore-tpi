from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    # CRUD comun. Nunca hace commit: eso le toca al Unit of Work

    def __init__(self, session: Session, model: type[T]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, id: int) -> T | None:
        return self.session.get(self.model, id)

    def get_all(self, skip: int = 0, limit: int = 100) -> list[T]:
        return list(self.session.exec(select(self.model).offset(skip).limit(limit)).all())

    def add(self, instancia: T) -> T:
        self.session.add(instancia)
        # flush manda el INSERT dentro de la transaccion: genera el id sin confirmar
        self.session.flush()
        self.session.refresh(instancia)
        return instancia

    def delete(self, instancia: T) -> None:
        self.session.delete(instancia)
        self.session.flush()
