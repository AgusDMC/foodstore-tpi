import EstadoError from '@/shared/components/EstadoError'
import Skeleton from '@/shared/components/Skeleton'
import BadgeEstado from '@/shared/ui/BadgeEstado'
import Button from '@/shared/ui/Button'
import Modal from '@/shared/ui/Modal'
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato'
import { usePedido } from '../hooks/usePedidos'

interface DetallePedidoModalProps {
  pedidoId: number
  onClose: () => void
}

// Detalle con sus lineas (GET /pedidos/{id}): precios copiados al crear el pedido
const DetallePedidoModal = ({ pedidoId, onClose }: DetallePedidoModalProps) => {
  const { data: pedido, isPending, error, refetch } = usePedido(pedidoId)

  return (
    <Modal abierto titulo={`Pedido #${pedidoId}`} ancho="lg">
      {isPending ? (
        <Skeleton filas={3} />
      ) : error ? (
        <EstadoError error={error} onRetry={() => refetch()} />
      ) : (
        <div className="flex flex-col gap-4 text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <p>
              <span className="text-gray-500">Estado:</span> <BadgeEstado estado={pedido.estado} />
            </p>
            <p>
              <span className="text-gray-500">Fecha:</span> {formatearFecha(pedido.created_at)}
            </p>
            <p>
              <span className="text-gray-500">Pago:</span> {pedido.forma_pago}
            </p>
            <p>
              <span className="text-gray-500">Entrega:</span> {pedido.direccion_entrega}
            </p>
            {pedido.notas && (
              <p className="sm:col-span-2">
                <span className="text-gray-500">Notas:</span> {pedido.notas}
              </p>
            )}
          </div>

          <table className="w-full text-left">
            <thead className="border-b border-gray-200 text-gray-500">
              <tr>
                <th className="py-2">Producto</th>
                <th className="py-2 text-right">Cant.</th>
                <th className="py-2 text-right">Precio</th>
                <th className="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {pedido.items.map((item) => (
                <tr key={item.producto_id} className="border-b border-gray-100">
                  <td className="py-2">{item.nombre_producto}</td>
                  <td className="py-2 text-right">{item.cantidad}</td>
                  <td className="py-2 text-right">{formatearPrecio(item.precio_unitario)}</td>
                  <td className="py-2 text-right">{formatearPrecio(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-right text-base font-bold">Total: {formatearPrecio(pedido.total)}</p>
        </div>
      )}
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </Modal>
  )
}

export default DetallePedidoModal
