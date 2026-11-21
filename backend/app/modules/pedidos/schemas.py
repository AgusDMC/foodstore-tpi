from datetime import datetime
from typing import Annotated, Literal

from pydantic import StringConstraints
from sqlmodel import Field, SQLModel

Estado = Literal["PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"]
FormaPago = Literal["EFECTIVO", "TRANSFERENCIA"]
Direccion = Annotated[str, StringConstraints(strip_whitespace=True, min_length=5, max_length=200)]
Notas = Annotated[str, StringConstraints(strip_whitespace=True, max_length=500)]


class ItemPedidoCreate(SQLModel):
    producto_id: int = Field(gt=0, schema_extra={"examples": [1]})
    cantidad: int = Field(ge=1, schema_extra={"examples": [2]})


class PedidoCreate(SQLModel):
    # RN-06: forma de pago y direccion se validan en el schema
    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago = Field(schema_extra={"examples": ["EFECTIVO"]})
    direccion_entrega: Direccion = Field(schema_extra={"examples": ["San Martín 1234"]})
    notas: Notas | None = Field(default=None, schema_extra={"examples": ["Tocar timbre"]})


class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: str | None
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead]


class PedidosPaginados(SQLModel):
    total: int
    items: list[PedidoRead]


class CambioEstado(SQLModel):
    estado: Estado = Field(schema_extra={"examples": ["EN_PREPARACION"]})


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
