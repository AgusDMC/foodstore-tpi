import { useState } from 'react'
import { Link } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Paginacion from '@/shared/components/Paginacion'
import Skeleton from '@/shared/components/Skeleton'
import BadgeEstado from '@/shared/ui/BadgeEstado'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import ConfirmDialog from '@/shared/ui/ConfirmDialog'
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato'
import DetallePedidoModal from '../components/DetallePedidoModal'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'
import type { Pedido } from '../types/pedido'

const POR_PAGINA = 10

const MisPedidosPage = () => {
  const [pagina, setPagina] = useState(0)
  const [verId, setVerId] = useState<number | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)

  const { data, isPending, error, refetch } = usePedidos({ skip: pagina * POR_PAGINA, limit: POR_PAGINA })
  const cancelar = useCancelarPedido()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-800">Mis pedidos</h1>

      {isPending ? (
        <Skeleton />
      ) : error ? (
        <EstadoError error={error} onRetry={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio mensaje="Todavía no hiciste pedidos.">
          <Link to="/" className="font-semibold text-brand hover:underline">
            Ir al catálogo
          </Link>
        </EstadoVacio>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {data.items.map((pedido) => (
              <Card key={pedido.id} className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Pedido #{pedido.id}</span>
                    <BadgeEstado estado={pedido.estado} />
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatearFecha(pedido.created_at)} · {pedido.items.length} productos · {pedido.forma_pago}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold">{formatearPrecio(pedido.total)}</span>
                  <Button variant="outline" className="px-3 py-1" onClick={() => setVerId(pedido.id)}>
                    Ver detalle
                  </Button>
                  {/* RN-04: el cliente solo cancela en PENDIENTE */}
                  {pedido.estado === 'PENDIENTE' && (
                    <Button
                      variant="danger"
                      className="px-3 py-1"
                      onClick={() => {
                        cancelar.reset()
                        setACancelar(pedido)
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <Paginacion pagina={pagina} totalPaginas={Math.ceil(data.total / POR_PAGINA)} onCambiar={setPagina} />
        </>
      )}

      {verId !== null && <DetallePedidoModal pedidoId={verId} onClose={() => setVerId(null)} />}

      <ConfirmDialog
        abierto={aCancelar !== null}
        titulo="Cancelar pedido"
        mensaje={`¿Cancelar el pedido #${aCancelar?.id}? Esta acción no se puede deshacer.`}
        textoConfirmar="Cancelar pedido"
        procesando={cancelar.isPending}
        error={cancelar.error ? handleApiError(cancelar.error) : null}
        onConfirm={() => aCancelar && cancelar.mutate(aCancelar.id, { onSuccess: () => setACancelar(null) })}
        onCancel={() => setACancelar(null)}
      />
    </div>
  )
}

export default MisPedidosPage
