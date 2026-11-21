from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.modules.usuarios.models import ahora

if TYPE_CHECKING:
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario


class Pedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    estado: str = Field(default="PENDIENTE", max_length=20)
    forma_pago: str = Field(max_length=20)
    direccion_entrega: str = Field(max_length=200)
    notas: str | None = None
    # Suma de los subtotales; fijo desde la creacion (RN-05)
    total: float = Field(default=0)
    created_at: datetime = Field(default_factory=ahora, sa_type=DateTime(timezone=True))
    # onupdate: se actualiza solo en cada cambio de estado
    updated_at: datetime = Field(
        default_factory=ahora,
        sa_type=DateTime(timezone=True),
        sa_column_kwargs={"onupdate": ahora},
    )

    usuario: "Usuario" = Relationship(back_populates="pedidos")
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalle_pedido"

    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", index=True)
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int
    # Copia del producto al momento de la compra: no cambia si despues cambia el precio
    nombre_producto: str = Field(max_length=150)
    precio_unitario: float
    subtotal: float

    pedido: Pedido = Relationship(back_populates="items")
    producto: "Producto" = Relationship(back_populates="detalles")
