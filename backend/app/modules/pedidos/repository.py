from datetime import datetime

from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository

from .models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def list_by_usuario(
        self, usuario_id: int | None, estado: str | None, skip: int, limit: int
    ) -> tuple[int, list[Pedido]]:
        # usuario_id None = todos (admin)
        filtros = []
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            filtros.append(Pedido.estado == estado)

        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filtros)).one()
        # selectinload trae las lineas de todos los pedidos en una sola consulta
        statement = (
            select(Pedido)
            .where(*filtros)
            .options(selectinload(Pedido.items))
            .order_by(col(Pedido.created_at).desc())
            .offset(skip)
            .limit(limit)
        )
        return total, list(self.session.exec(statement).all())

    def count_by_estado(self) -> dict[str, int]:
        statement = select(Pedido.estado, func.count()).group_by(Pedido.estado)
        return {estado: cantidad for estado, cantidad in self.session.exec(statement).all()}

    def count_desde(self, desde: datetime) -> int:
        statement = select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        return self.session.exec(statement).one()

    def sum_total_por_estado(self, estado: str) -> float:
        statement = select(func.coalesce(func.sum(Pedido.total), 0)).where(
            Pedido.estado == estado
        )
        return float(self.session.exec(statement).one())
