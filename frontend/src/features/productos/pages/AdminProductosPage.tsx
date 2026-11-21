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
import Button from '@/shared/ui/Button'
import ConfirmDialog from '@/shared/ui/ConfirmDialog'
import { formatearPrecio } from '@/shared/utils/formato'
import ProductoModal from '../components/ProductoModal'
import StockModal from '../components/StockModal'
import { useProductoMutations, useProductos } from '../hooks/useProductos'
import type { Producto, ProductoData } from '../types/producto'

const columnHelper = createColumnHelper<Producto>()
const columns = [
  columnHelper.accessor('id', { header: '#' }),
  columnHelper.accessor('nombre', { header: 'Nombre' }),
  columnHelper.accessor((p) => p.categoria.nombre, { id: 'categoria', header: 'Categoría' }),
  columnHelper.accessor('precio_base', { header: 'Precio', cell: (info) => formatearPrecio(info.getValue()) }),
  columnHelper.accessor('stock', { header: 'Stock' }),
  columnHelper.accessor('disponible', {
    header: 'Disponible',
    cell: (info) =>
      info.getValue() ? (
        <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">Sí</span>
      ) : (
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-600">No</span>
      ),
  }),
  columnHelper.display({
    id: 'acciones',
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row, table }) => (
      <div className="flex justify-end gap-2">
        <Button variant="outline" className="px-3 py-1" onClick={() => table.options.meta?.onStock?.(row.original)}>
          Stock
        </Button>
        <Button variant="outline" className="px-3 py-1" onClick={() => table.options.meta?.onEdit?.(row.original)}>
          Editar
        </Button>
        <Button variant="danger" className="px-3 py-1" onClick={() => table.options.meta?.onDelete?.(row.original)}>
          Eliminar
        </Button>
      </div>
    ),
  }),
]
const sinDatos: Producto[] = []

const AdminProductosPage = () => {
  // undefined = modal cerrado, null = alta, Producto = edicion
  const [editando, setEditando] = useState<Producto | null | undefined>(undefined)
  const [enStock, setEnStock] = useState<Producto | null>(null)
  const [aEliminar, setAEliminar] = useState<Producto | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  // El panel pide hasta 100 y pagina en el cliente con TanStack Table
  const { data, isPending, error, refetch } = useProductos({ skip: 0, limit: 100 })
  const { crear, editar, stock, eliminar } = useProductoMutations()

  const table = useReactTable({
    data: data?.items ?? sinDatos,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    autoResetPageIndex: false,
    initialState: { pagination: { pageSize: 8 } },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      onEdit: (p) => abrirModal(p),
      onStock: (p) => {
        stock.reset()
        setEnStock(p)
      },
      onDelete: (p) => {
        eliminar.reset()
        setAEliminar(p)
      },
    },
  })

  function abrirModal(producto: Producto | null) {
    crear.reset()
    editar.reset()
    setEditando(producto)
  }

  const guardar = (datos: ProductoData) => {
    const cerrar = { onSuccess: () => setEditando(undefined) }
    if (editando) editar.mutate({ id: editando.id, data: datos }, cerrar)
    else crear.mutate(datos, cerrar)
  }

  const mutacion = editando ? editar : crear

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
          <p className="text-sm text-gray-500">{data?.total ?? 0} productos activos</p>
        </div>
        <Button onClick={() => abrirModal(null)}>+ Nuevo producto</Button>
      </div>

      {isPending ? (
        <Skeleton />
      ) : error ? (
        <EstadoError error={error} onRetry={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio mensaje="Todavía no hay productos." />
      ) : (
        <DataTable table={table} />
      )}

      {editando !== undefined && (
        <ProductoModal
          key={editando?.id ?? 'nuevo'}
          producto={editando}
          guardando={mutacion.isPending}
          error={mutacion.error ? handleApiError(mutacion.error) : null}
          onGuardar={guardar}
          onClose={() => setEditando(undefined)}
        />
      )}

      {enStock && (
        <StockModal
          key={enStock.id}
          producto={enStock}
          guardando={stock.isPending}
          error={stock.error ? handleApiError(stock.error) : null}
          onGuardar={(datos) => stock.mutate({ id: enStock.id, data: datos }, { onSuccess: () => setEnStock(null) })}
          onClose={() => setEnStock(null)}
        />
      )}

      <ConfirmDialog
        abierto={aEliminar !== null}
        titulo="Dar de baja producto"
        mensaje={`¿Dar de baja "${aEliminar?.nombre}"? Dejará de aparecer en el catálogo.`}
        textoConfirmar="Dar de baja"
        procesando={eliminar.isPending}
        error={eliminar.error ? handleApiError(eliminar.error) : null}
        onConfirm={() => aEliminar && eliminar.mutate(aEliminar.id, { onSuccess: () => setAEliminar(null) })}
        onCancel={() => setAEliminar(null)}
      />
    </div>
  )
}

export default AdminProductosPage
