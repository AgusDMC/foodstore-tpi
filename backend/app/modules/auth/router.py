from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import CurrentUser, UsuarioServiceDep
from app.modules.usuarios.schemas import UserCreate, UserPublic

from .schemas import Mensaje
from .service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service(usuarios: UsuarioServiceDep) -> AuthService:
    return AuthService(usuarios)


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


# POST /auth/register | 201 | 409 username o email repetido
@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def registrar(data: UserCreate, service: AuthServiceDep):
    return service.registrar(data)


# POST /auth/token | 200 + cookie | 401 credenciales | 400 desactivado
@router.post("/token", response_model=Mensaje)
def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: AuthServiceDep,
    response: Response,
):
    token = service.login(form.username, form.password)
    # El token va en la cookie HttpOnly y no en el body: JavaScript no puede leerlo
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
    )
    return Mensaje(message="Login exitoso")


# POST /auth/logout | 200 | borra la cookie
@router.post("/logout", response_model=Mensaje)
def logout(response: Response):
    response.delete_cookie(key="access_token", httponly=True, samesite="lax")
    return Mensaje(message="Sesión cerrada")


# GET /auth/me | 200 | 401 sin sesion | 400 desactivado
@router.get("/me", response_model=UserPublic)
def me(usuario: CurrentUser):
    return usuario
