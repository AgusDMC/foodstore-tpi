from fastapi import HTTPException, status

from app.core.security import hash_password, verify_password

from .models import Usuario
from .schemas import UserCreate, UserPublic
from .unit_of_work import UsuarioUnitOfWork

# Como en el proyecto de seguridad de la materia, aca se lanza HTTPException directo


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username) or uow.usuarios.get_by_email(
                data.email
            ):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El username o el email ya están registrados",
                )
            # El registro publico siempre crea rol user
            usuario = uow.usuarios.add(
                Usuario(
                    username=data.username,
                    full_name=data.full_name,
                    email=data.email.lower(),
                    hashed_password=hash_password(data.password),
                    role="user",
                )
            )
            return UserPublic.model_validate(usuario)

    def autenticar(self, username: str, password: str) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username.strip())
            # Mismo mensaje si no existe o si la clave no coincide: no revela cual fallo
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Usuario o contraseña incorrectos",
                )
            if usuario.disabled:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cuenta de usuario desactivada",
                )
            return UserPublic.model_validate(usuario)

    def obtener_por_username(self, username: str) -> UserPublic | None:
        # Lo usa get_current_user en cada request con sesion
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            return UserPublic.model_validate(usuario) if usuario else None

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.listar()]

    def cambiar_estado(self, id: int, disabled: bool, admin_id: int) -> UserPublic:
        if disabled and id == admin_id:
            # Si el admin se desactiva a si mismo el sistema podria quedar sin admin
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No podés desactivar tu propia cuenta",
            )
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(id)
            if usuario is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
                )
            # Idempotente: si ya tenia ese estado responde 200 igual
            usuario.disabled = disabled
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)
