from typing import Annotated

from pydantic import StringConstraints
from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead

Nombre = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=150)]
Texto = Annotated[str, StringConstraints(strip_whitespace=True, max_length=500)]


class ProductoCreate(SQLModel):
    nombre: Nombre = Field(schema_extra={"examples": ["Pizza muzzarella"]})
    descripcion: Texto | None = Field(
        default=None, schema_extra={"examples": ["Salsa de tomate y muzzarella"]}
    )
    precio_base: float = Field(ge=0, schema_extra={"examples": [9500.0]})
    imagen_url: Texto | None = Field(
        default=None, schema_extra={"examples": ["https://placehold.co/400x300"]}
    )
    stock: int = Field(default=0, ge=0, schema_extra={"examples": [20]})
    disponible: bool = True
    categoria_id: int = Field(gt=0, schema_extra={"examples": [1]})


class ProductoUpdate(SQLModel):
    # Actualizacion parcial: solo cambia lo que se envia
    nombre: Nombre | None = None
    descripcion: Texto | None = None
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: Texto | None = None
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None
    categoria_id: int | None = Field(default=None, gt=0)


class ProductoStockUpdate(SQLModel):
    stock: int | None = Field(default=None, ge=0, schema_extra={"examples": [15]})
    disponible: bool | None = Field(default=None, schema_extra={"examples": [True]})


class ProductoRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    precio_base: float
    imagen_url: str | None
    stock: int
    disponible: bool
    activo: bool
    categoria_id: int
    categoria: CategoriaRead


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
