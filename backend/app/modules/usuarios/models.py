from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido


def ahora() -> datetime:
    return datetime.now(timezone.utc)


class Usuario(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(max_length=50, unique=True, index=True)
    full_name: str = Field(max_length=100)
    email: str = Field(max_length=254, unique=True, index=True)
    # Hash bcrypt, nunca la clave en texto plano
    hashed_password: str
    # "user" o "admin"; el registro publico siempre crea "user"
    role: str = Field(default="user", max_length=20)
    # Baja logica: el admin activa o desactiva
    disabled: bool = Field(default=False)
    created_at: datetime = Field(default_factory=ahora, sa_type=DateTime(timezone=True))

    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
