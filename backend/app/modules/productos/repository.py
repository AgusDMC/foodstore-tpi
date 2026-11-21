from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository

from .models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def search(
        self,
        skip: int,
        limit: int,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, list[Producto]]:
        # Solo activos; los filtros se suman si vienen
        filtros = [col(Producto.activo).is_(True)]
        if search:
            filtros.append(col(Producto.nombre).ilike(f"%{search}%"))
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*filtros)).one()
        # selectinload trae las categorias en una sola consulta extra (sin N+1)
        statement = (
            select(Producto)
            .where(*filtros)
            .options(selectinload(Producto.categoria))
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        )
        return total, list(self.session.exec(statement).all())
