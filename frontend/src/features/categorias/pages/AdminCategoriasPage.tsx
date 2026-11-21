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
import CategoriaModal from '../components/CategoriaModal'
import { useCategoriaMutations, useCategorias } from '../hooks/useCategorias'
import type { Categoria, CategoriaData } from '../types/categoria'

// Columnas fuera del componente: misma referencia en cada render
const columnHelper = createColumnHelper<Categoria>()
const columns = [
  columnHelper.accessor('id', { header: '#' }),
  columnHelper.accessor('nombre', { header: 'Nombre' }),
  columnHelper.accessor('descripcion', {
    header: 'Descripción',
    enableSorting: false,
    cell: (info) => info.getValue() || <span className="text-gray-400 italic">Sin descripción</span>,
  }),
  columnHelper.display({
    id: 'acciones',
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row, table }) => (
      <div className="flex justify-end gap-2">
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
const sinDatos: Categoria[] = []

const AdminCategoriasPage = () => {
  // undefined = modal cerrado, null = alta, Categoria = edicion
  const [editando, setEditando] = useState<Categoria | null | undefined>(undefined)
  const [aEliminar, setAEliminar] = useState<Categoria | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  const { data, isPending, error, refetch } = useCategorias()
  const { crear, editar, eliminar } = useCategoriaMutations()

  const table = useReactTable({
    data: data ?? sinDatos,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    // Al editar no se vuelve a la pagina 1
    autoResetPageIndex: false,
    initialState: { pagination: { pageSize: 5 } },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      onEdit: (c) => abrirModal(c),
      onDelete: (c) => {
        eliminar.reset()
        setAEliminar(c)
      },
    },
  })

  function abrirModal(categoria: Categoria | null) {
    crear.reset()
    editar.reset()
    setEditando(categoria)
  }

  const guardar = (datos: CategoriaData) => {
    const cerrar = { onSuccess: () => setEditando(undefined) }
    if (editando) editar.mutate({ id: editando.id, data: datos }, cerrar)
    else crear.mutate(datos, cerrar)
  }

  const mutacion = editando ? editar : crear

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
          <p className="text-sm text-gray-500">{data?.length ?? 0} categorías activas</p>
        </div>
        <Button onClick={() => abrirModal(null)}>+ Nueva categoría</Button>
      </div>

      {isPending ? (
        <Skeleton />
      ) : error ? (
        <EstadoError error={error} onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <EstadoVacio mensaje="Todavía no hay categorías." />
      ) : (
        <DataTable table={table} />
      )}

      {editando !== undefined && (
        <CategoriaModal
          key={editando?.id ?? 'nueva'}
          categoria={editando}
          guardando={mutacion.isPending}
          error={mutacion.error ? handleApiError(mutacion.error) : null}
          onGuardar={guardar}
          onClose={() => setEditando(undefined)}
        />
      )}

      <ConfirmDialog
        abierto={aEliminar !== null}
        titulo="Dar de baja categoría"
        mensaje={`¿Dar de baja "${aEliminar?.nombre}"? Sus productos siguen en el catálogo hasta que los des de baja.`}
        textoConfirmar="Dar de baja"
        procesando={eliminar.isPending}
        error={eliminar.error ? handleApiError(eliminar.error) : null}
        onConfirm={() => aEliminar && eliminar.mutate(aEliminar.id, { onSuccess: () => setAEliminar(null) })}
        onCancel={() => setAEliminar(null)}
      />
    </div>
  )
}

export default AdminCategoriasPage
