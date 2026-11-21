from datetime import datetime
from typing import Annotated

from pydantic import AfterValidator, EmailStr, StringConstraints
from sqlmodel import Field, SQLModel


def _max_72_bytes(valor: str) -> str:
    # bcrypt solo usa 72 bytes y una letra con tilde ocupa 2
    if len(valor.encode("utf-8")) > 72:
        raise ValueError("La contraseña no puede superar los 72 bytes")
    return valor


Username = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=3, max_length=50, pattern=r"^\S+$"),
]
NombreCompleto = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=2, max_length=100)
]
Password = Annotated[str, StringConstraints(min_length=8), AfterValidator(_max_72_bytes)]


class UserCreate(SQLModel):
    username: Username = Field(schema_extra={"examples": ["maria"]})
    full_name: NombreCompleto = Field(schema_extra={"examples": ["María García"]})
    email: EmailStr = Field(schema_extra={"examples": ["maria@example.com"]})
    password: Password = Field(schema_extra={"examples": ["Maria1234!"]})


class UserPublic(SQLModel):
    # Sin hashed_password: el hash nunca sale del servidor
    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
