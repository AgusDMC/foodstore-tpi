from app.modules.categorias.service import CategoriaNoEncontrada

from .models import Producto
from .schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from .unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def _activo_o_error(self, uow: ProductoUnitOfWork, id: int) -> Producto:
        # Un producto dado de baja se trata como inexistente
        producto = uow.productos.get_by_id(id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado(f"Producto {id} no encontrado")
        return producto

    def _validar_categoria(self, uow: ProductoUnitOfWork, categoria_id: int) -> None:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(f"Categoría {categoria_id} no encontrada")

    def listar(
        self,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(
                skip, limit, search, categoria_id, disponible
            )
            return ProductosPaginados(
                total=total, items=[ProductoRead.model_validate(p) for p in productos]
            )

    def obtener(self, id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._activo_o_error(uow, id))

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._validar_categoria(uow, data.categoria_id)
            producto = uow.productos.add(Producto.model_validate(data))
            return ProductoRead.model_validate(producto)

    def actualizar(self, id: int, data: ProductoUpdate) -> ProductoRead:
        # exclude_none: un null enviado no pisa el valor guardado
        cambios = data.model_dump(exclude_unset=True, exclude_none=True)
        with self.uow as uow:
            producto = self._activo_o_error(uow, id)
            if "categoria_id" in cambios:
                self._validar_categoria(uow, cambios["categoria_id"])
            producto.sqlmodel_update(cambios)
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, id: int, data: ProductoStockUpdate) -> ProductoRead:
        cambios = data.model_dump(exclude_unset=True, exclude_none=True)
        with self.uow as uow:
            producto = self._activo_o_error(uow, id)
            producto.sqlmodel_update(cambios)
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, id: int) -> None:
        with self.uow as uow:
            producto = self._activo_o_error(uow, id)
            producto.activo = False
            uow.productos.add(producto)
