from typing import Annotated

from fastapi import Depends, HTTPException, Request, status

from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork(session_factory))


UsuarioServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]


def get_current_user(request: Request, service: UsuarioServiceDep) -> UserPublic:
    # El token sale solo de la cookie HttpOnly, nunca del body ni de localStorage
    no_autenticado = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado o sesión vencida",
    )
    token = request.cookies.get("access_token")
    if not token:
        raise no_autenticado
    payload = decode_access_token(token)
    if payload is None or not payload.get("sub"):
        raise no_autenticado
    usuario = service.obtener_por_username(payload["sub"])
    if usuario is None:
        raise no_autenticado
    return usuario


def get_current_active_user(
    usuario: Annotated[UserPublic, Depends(get_current_user)],
) -> UserPublic:
    # Se revisa en cada request: la cuenta pudo desactivarse despues del login
    if usuario.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )
    return usuario


def require_role(roles: list[str]):
    # Fabrica de dependencias: exige que el usuario tenga alguno de los roles
    def verificar(
        usuario: Annotated[UserPublic, Depends(get_current_active_user)],
    ) -> UserPublic:
        if usuario.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para esta acción",
            )
        return usuario

    return verificar


# Atajos para los routers
CurrentUser = Annotated[UserPublic, Depends(get_current_active_user)]
AdminUser = Annotated[UserPublic, Depends(require_role(["admin"]))]
