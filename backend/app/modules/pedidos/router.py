from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.database import session_factory
from app.core.deps import AdminUser, CurrentUser
from app.modules.productos.service import ProductoNoEncontrado

from .schemas import CambioEstado, Estado, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from .service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from .unit_of_work import PedidoUnitOfWork

router = APIRouter(prefix="/pedidos", tags=["pedidos"])

# Excepcion de dominio -> codigo HTTP de la especificacion
CODIGOS: dict[type[Exception], int] = {
    PedidoNoEncontrado: 404,
    ProductoNoEncontrado: 404,
    PedidoAjeno: 403,
    StockInsuficiente: 400,
    ProductoNoDisponible: 400,
    ProductoRepetido: 400,
    TransicionInvalida: 400,
}
ERRORES = tuple(CODIGOS)


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork(session_factory))


ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]


def a_http(e: Exception) -> HTTPException:
    return HTTPException(status_code=CODIGOS[type(e)], detail=str(e))


# POST /pedidos | 201 | sesion | 404 producto | 400 stock, no disponible, repetido
@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(usuario: CurrentUser, data: PedidoCreate, service: ServiceDep):
    try:
        return service.crear(data, usuario)
    except ERRORES as e:
        raise a_http(e) from e


# GET /pedidos | 200 | propios (user) o todos (admin)
@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    usuario: CurrentUser,
    service: ServiceDep,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    estado: Estado | None = None,
):
    return service.listar(usuario, estado, skip, limit)


# GET /pedidos/resumen | 200 | admin. Va antes de /{id} para que no lo tome como id
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(_admin: AdminUser, service: ServiceDep):
    return service.resumen()


# GET /pedidos/{id} | 200 | dueno o admin | 404, 403
@router.get("/{id}", response_model=PedidoRead)
def detalle_pedido(usuario: CurrentUser, service: ServiceDep, id: int = Path(gt=0)):
    try:
        return service.obtener(id, usuario)
    except ERRORES as e:
        raise a_http(e) from e


# PATCH /pedidos/{id}/estado | 200 | admin | 404, 400 transicion invalida
@router.patch("/{id}/estado", response_model=PedidoRead)
def cambiar_estado(
    admin: AdminUser, data: CambioEstado, service: ServiceDep, id: int = Path(gt=0)
):
    try:
        return service.cambiar_estado(id, data, admin)
    except ERRORES as e:
        raise a_http(e) from e


# PATCH /pedidos/{id}/cancelar | 200 | dueno | 404, 403, 400 si no esta PENDIENTE
@router.patch("/{id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(usuario: CurrentUser, service: ServiceDep, id: int = Path(gt=0)):
    try:
        return service.cancelar(id, usuario)
    except ERRORES as e:
        raise a_http(e) from e
