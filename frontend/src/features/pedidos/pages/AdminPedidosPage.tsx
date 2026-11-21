import { useState } from 'react'
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { handleApiError } from '@/shared/api/handleApiError'
import DataTable from '@/shared/components/DataTable'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Skeleton from '@/shared/components/Skeleton'
import BadgeEstado from '@/shared/ui/BadgeEstado'
import Button from '@/shared/ui/Button'
import ErrorApi from '@/shared/ui/ErrorApi'
import { inputClass } from '@/shared/ui/Input'
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato'
import DetallePedidoModal from '../components/DetallePedidoModal'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import { ESTADOS, TRANSICIONES, type EstadoPedido, type Pedido } from '../types/pedido'

const textoBoton: Record<EstadoPedido, string> = {
  PENDIENTE: '',
  EN_PREPARACION: 'Preparar',
  ENTREGADO: 'Entregar',
  CANCELADO: 'Cancelar',
}

const columnHelper = createColumnHelper<Pedido>()
const columns = [
  columnHelper.accessor('id', { header: '#' }),
  columnHelper.accessor('created_at', { header: 'Fecha', cell: (info) => formatearFecha(info.getValue()) }),
  columnHelper.accessor('usuario_id', { header: 'Usuario' }),
  columnHelper.accessor('forma_pago', { header: 'Pago' }),
  columnHelper.accessor('total', { header: 'Total', cell: (info) => formatearPrecio(info.getValue()) }),
  columnHelper.accessor('estado', { header: 'Estado', cell: (info) => <BadgeEstado estado={info.getValue()} /> }),
  columnHelper.display({
    id: 'acciones',
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row, table }) => {
      const pedido = row.original
      return (
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="px-3 py-1" onClick={() => table.options.meta?.onVer?.(pedido)}>
            Ver
          </Button>
          {/* Solo las transiciones validas desde el estado actual (RN-02) */}
          {TRANSICIONES[pedido.estado].map((destino) => (
            <Button
              key={destino}
              variant={destino === 'CANCELADO' ? 'danger' : 'primary'}
              className="px-3 py-1"
              disabled={table.options.meta?.procesando}
              onClick={() => table.options.meta?.onCambiarEstado?.(pedido, destino)}
            >
              {textoBoton[destino]}
            </Button>
          ))}
        </div>
      )
    },
  }),
]
const sinDatos: Pedido[] = []

const AdminPedidosPage = () => {
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  const [verId, setVerId] = useState<number | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  // Filtro por estado en el servidor; paginacion en el cliente (limit 100)
  const { data, isPending, error, refetch } = usePedidos({ skip: 0, limit: 100, estado })
  const cambiarEstado = useCambiarEstadoPedido()

  const table = useReactTable({
    data: data?.items ?? sinDatos,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    autoResetPageIndex: false,
    initialState: { pagination: { pageSize: 10 } },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      procesando: cambiarEstado.isPending,
      onVer: (p) => setVerId(p.id),
      onCambiarEstado: (p, destino) => cambiarEstado.mutate({ id: p.id, estado: destino as EstadoPedido }),
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pedidos</h1>
          <p className="text-sm text-gray-500">{data?.total ?? 0} pedidos</p>
        </div>
        <select
          value={estado ?? ''}
          onChange={(e) => {
            setEstado((e.target.value || undefined) as EstadoPedido | undefined)
            table.setPageIndex(0)
          }}
          aria-label="Filtrar por estado"
          className={inputClass}
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <ErrorApi mensaje={cambiarEstado.error ? handleApiError(cambiarEstado.error) : null} />

      {isPending ? (
        <Skeleton />
      ) : error ? (
        <EstadoError error={error} onRetry={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio mensaje="No hay pedidos con ese filtro." />
      ) : (
        <DataTable table={table} />
      )}

      {verId !== null && <DetallePedidoModal pedidoId={verId} onClose={() => setVerId(null)} />}
    </div>
  )
}

export default AdminPedidosPage
