from app.core.security import create_access_token
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioService


class AuthService:
    # Usa el modelo Usuario a traves del service de usuarios: no tiene repositorio propio

    def __init__(self, usuarios: UsuarioService) -> None:
        self.usuarios = usuarios

    def registrar(self, data: UserCreate) -> UserPublic:
        return self.usuarios.registrar(data)

    def login(self, username: str, password: str) -> str:
        usuario = self.usuarios.autenticar(username, password)
        # sub = username: get_current_user lo busca con ese dato
        return create_access_token(sub=usuario.username)
