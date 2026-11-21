from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.database import session_factory
from app.core.deps import AdminUser
from app.modules.categorias.service import CategoriaNoEncontrada

from .schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from .service import ProductoNoEncontrado, ProductoService
from .unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork(session_factory))


ServiceDep = Annotated[ProductoService, Depends(get_producto_service)]


def a_http(e: Exception) -> HTTPException:
    # Las dos son 404: producto inexistente o categoria inexistente / dada de baja
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# GET /productos | 200 | publico, paginado con busqueda y filtros
@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: ServiceDep,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None, max_length=100),
    categoria_id: int | None = Query(default=None, gt=0),
    disponible: bool | None = None,
):
    return service.listar(skip, limit, search, categoria_id, disponible)


# GET /productos/{id} | 200 | 404
@router.get("/{id}", response_model=ProductoRead)
def detalle_producto(service: ServiceDep, id: int = Path(gt=0)):
    try:
        return service.obtener(id)
    except ProductoNoEncontrado as e:
        raise a_http(e) from e


# POST /productos | 201 | admin | 404 categoria
@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(_admin: AdminUser, data: ProductoCreate, service: ServiceDep):
    try:
        return service.crear(data)
    except CategoriaNoEncontrada as e:
        raise a_http(e) from e


# PUT /productos/{id} | 200 | admin | 404 producto o categoria
@router.put("/{id}", response_model=ProductoRead)
def editar_producto(
    _admin: AdminUser, data: ProductoUpdate, service: ServiceDep, id: int = Path(gt=0)
):
    try:
        return service.actualizar(id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as e:
        raise a_http(e) from e


# PATCH /productos/{id}/stock | 200 | admin | 404
@router.patch("/{id}/stock", response_model=ProductoRead)
def editar_stock(
    _admin: AdminUser, data: ProductoStockUpdate, service: ServiceDep, id: int = Path(gt=0)
):
    try:
        return service.actualizar_stock(id, data)
    except ProductoNoEncontrado as e:
        raise a_http(e) from e


# DELETE /productos/{id} | 204 baja logica | admin | 404
@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(_admin: AdminUser, service: ServiceDep, id: int = Path(gt=0)):
    try:
        service.eliminar(id)
    except ProductoNoEncontrado as e:
        raise a_http(e) from e
