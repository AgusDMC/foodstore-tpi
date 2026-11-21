from datetime import datetime

from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic

from .models import DetallePedido, Pedido
from .schemas import CambioEstado, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from .unit_of_work import PedidoUnitOfWork

# Maquina de estados (RN-02): desde cada estado, a cuales se puede pasar
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


# Excepciones de dominio: el router las traduce a HTTP
class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class TransicionInvalida(Exception):
    pass


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def _obtener(self, uow: PedidoUnitOfWork, id: int, usuario: UserPublic) -> Pedido:
        pedido = uow.pedidos.get_by_id(id)
        if pedido is None:
            raise PedidoNoEncontrado(f"Pedido {id} no encontrado")
        # RN-04: el cliente solo accede a sus pedidos
        if usuario.role != "admin" and pedido.usuario_id != usuario.id:
            raise PedidoAjeno("El pedido pertenece a otro usuario")
        return pedido

    def _restituir_stock(self, uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        # RN-03: devuelve el stock de cada linea en la misma transaccion
        for item in pedido.items:
            producto = uow.productos.get_by_id(item.producto_id)
            if producto is not None:
                producto.stock += item.cantidad

    def crear(self, data: PedidoCreate, usuario: UserPublic) -> PedidoRead:
        ids = [item.producto_id for item in data.items]
        with self.uow as uow:
            if len(ids) != len(set(ids)):
                raise ProductoRepetido("Hay productos repetidos en el pedido")

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario.id,
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas,
                    total=0,
                )
            )
            total = 0.0
            # RN-01: por item se valida, se descuenta el stock y se copia nombre y precio
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"Producto {item.producto_id} no encontrado")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"'{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente de '{producto.nombre}' (quedan {producto.stock})"
                    )
                producto.stock -= item.cantidad
                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal
            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def listar(
        self, usuario: UserPublic, estado: str | None, skip: int, limit: int
    ) -> PedidosPaginados:
        # El admin ve todos; el cliente solo los suyos
        filtro = None if usuario.role == "admin" else usuario.id
        with self.uow as uow:
            total, pedidos = uow.pedidos.list_by_usuario(filtro, estado, skip, limit)
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in pedidos]
            )

    def obtener(self, id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            return PedidoRead.model_validate(self._obtener(uow, id, usuario))

    def cambiar_estado(self, id: int, data: CambioEstado, admin: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, id, admin)
            # Se valida antes de tocar el pedido (RN-02)
            if data.estado not in TRANSICIONES[pedido.estado]:
                raise TransicionInvalida(
                    f"No se puede pasar de {pedido.estado} a {data.estado}"
                )
            if data.estado == "CANCELADO":
                self._restituir_stock(uow, pedido)
            pedido.estado = data.estado
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, id, usuario)
            # Solo el dueno, aunque sea admin: los ajenos se cancelan por /estado
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida("Solo se puede cancelar un pedido PENDIENTE")
            self._restituir_stock(uow, pedido)
            pedido.estado = "CANCELADO"
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        # Inicio del dia en la hora local del servidor
        hoy = datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            return ResumenPedidos(
                pendientes=conteos.get("PENDIENTE", 0),
                en_preparacion=conteos.get("EN_PREPARACION", 0),
                entregados=conteos.get("ENTREGADO", 0),
                cancelados=conteos.get("CANCELADO", 0),
                pedidos_hoy=uow.pedidos.count_desde(hoy),
                ingresos_entregados=uow.pedidos.sum_total_por_estado("ENTREGADO"),
            )
