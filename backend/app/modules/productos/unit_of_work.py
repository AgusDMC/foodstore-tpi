from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository

from .repository import ProductoRepository


class ProductoUnitOfWork(UnitOfWork):
    # Expone categorias para validar categoria_id en la misma sesion
    def __enter__(self) -> "ProductoUnitOfWork":
        super().__enter__()
        self.productos = ProductoRepository(self.session)
        self.categorias = CategoriaRepository(self.session)
        return self
