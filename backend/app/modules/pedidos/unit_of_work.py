from app.core.unit_of_work import UnitOfWork
from app.modules.productos.repository import ProductoRepository

from .repository import PedidoRepository


class PedidoUnitOfWork(UnitOfWork):
    # Pedidos y productos comparten la sesion: el descuento de stock y el pedido
    # se confirman o se descartan juntos
    def __enter__(self) -> "PedidoUnitOfWork":
        super().__enter__()
        self.pedidos = PedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)
        return self
