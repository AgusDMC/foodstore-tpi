from typing import Annotated

from pydantic import StringConstraints
from sqlmodel import Field, SQLModel

Nombre = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=100)]
Descripcion = Annotated[str, StringConstraints(strip_whitespace=True, max_length=500)]


class CategoriaCreate(SQLModel):
    nombre: Nombre = Field(schema_extra={"examples": ["Pizzas"]})
    descripcion: Descripcion | None = Field(
        default=None, schema_extra={"examples": ["Pizzas a la piedra"]}
    )


class CategoriaUpdate(SQLModel):
    # Actualizacion parcial: solo cambia lo que se envia
    nombre: Nombre | None = Field(default=None, schema_extra={"examples": ["Pizzas"]})
    descripcion: Descripcion | None = None


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    activo: bool
