from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    # Unico tambien entre las dadas de baja: la baja no libera el nombre
    nombre: str = Field(max_length=100, unique=True)
    descripcion: str | None = None
    # Baja logica
    activo: bool = Field(default=True)

    productos: list["Producto"] = Relationship(back_populates="categoria")
