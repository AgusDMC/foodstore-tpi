from fastapi import APIRouter, Path

from app.core.deps import AdminUser, UsuarioServiceDep

from .schemas import UserPublic

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios"])


# GET /admin/usuarios | 200 | solo admin
@router.get("", response_model=list[UserPublic])
def listar_usuarios(_admin: AdminUser, service: UsuarioServiceDep):
    return service.listar()


# POST /admin/usuarios/{id}/activar | 200 | 404
@router.post("/{id}/activar", response_model=UserPublic)
def activar_usuario(admin: AdminUser, service: UsuarioServiceDep, id: int = Path(gt=0)):
    return service.cambiar_estado(id, disabled=False, admin_id=admin.id)


# POST /admin/usuarios/{id}/desactivar | 200 | 404 | 400 si es el propio admin
@router.post("/{id}/desactivar", response_model=UserPublic)
def desactivar_usuario(admin: AdminUser, service: UsuarioServiceDep, id: int = Path(gt=0)):
    return service.cambiar_estado(id, disabled=True, admin_id=admin.id)
