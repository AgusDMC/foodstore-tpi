from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.core.database import session_factory
from app.core.deps import AdminUser

from .schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from .unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["categorias"])


def get_categoria_service() -> CategoriaService:
    # Cada request recibe un service con su propio Unit of Work
    return CategoriaService(CategoriaUnitOfWork(session_factory))


ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]


def a_http(e: Exception) -> HTTPException:
    # Traduce la excepcion de dominio al codigo de la especificacion
    codigos = {CategoriaNoEncontrada: 404, NombreDuplicado: 409}
    return HTTPException(status_code=codigos[type(e)], detail=str(e))


# GET /categorias | 200 | publico, solo activas
@router.get("", response_model=list[CategoriaRead])
def listar_categorias(service: ServiceDep):
    return service.listar()


# GET /categorias/{id} | 200 | 404
@router.get("/{id}", response_model=CategoriaRead)
def detalle_categoria(service: ServiceDep, id: int = Path(gt=0)):
    try:
        return service.obtener(id)
    except CategoriaNoEncontrada as e:
        raise a_http(e) from e


# POST /categorias | 201 | admin | 409 nombre repetido
@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(_admin: AdminUser, data: CategoriaCreate, service: ServiceDep):
    try:
        return service.crear(data)
    except NombreDuplicado as e:
        raise a_http(e) from e


# PUT /categorias/{id} | 200 | admin | 404, 409
@router.put("/{id}", response_model=CategoriaRead)
def editar_categoria(
    _admin: AdminUser, data: CategoriaUpdate, service: ServiceDep, id: int = Path(gt=0)
):
    try:
        return service.actualizar(id, data)
    except (CategoriaNoEncontrada, NombreDuplicado) as e:
        raise a_http(e) from e


# DELETE /categorias/{id} | 204 baja logica | admin | 404
@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(_admin: AdminUser, service: ServiceDep, id: int = Path(gt=0)):
    try:
        service.eliminar(id)
    except CategoriaNoEncontrada as e:
        raise a_http(e) from e
