from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository

from .models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        # Sin distinguir mayusculas e incluyendo las dadas de baja
        statement = select(Categoria).where(func.lower(Categoria.nombre) == nombre.lower())
        return self.session.exec(statement).first()

    def listar_activas(self) -> list[Categoria]:
        statement = select(Categoria).where(Categoria.activo).order_by(Categoria.nombre)
        return list(self.session.exec(statement).all())
