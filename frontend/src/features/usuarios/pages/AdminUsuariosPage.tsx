import { useState } from 'react'
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import type { Usuario } from '@/features/auth/types/auth'
import { handleApiError } from '@/shared/api/handleApiError'
import DataTable from '@/shared/components/DataTable'
import EstadoError from '@/shared/components/EstadoError'
import Skeleton from '@/shared/components/Skeleton'
import Button from '@/shared/ui/Button'
import ErrorApi from '@/shared/ui/ErrorApi'
import { useAuthStore } from '@/store/authStore'
import { useCambiarEstadoUsuario, useUsuarios } from '../hooks/useUsuarios'

const columnHelper = createColumnHelper<Usuario>()
const columns = [
  columnHelper.accessor('username', { header: 'Usuario' }),
  columnHelper.accessor('full_name', { header: 'Nombre' }),
  columnHelper.accessor('email', { header: 'Email' }),
  columnHelper.accessor('role', { header: 'Rol' }),
  columnHelper.accessor('disabled', {
    header: 'Estado',
    cell: (info) =>
      info.getValue() ? (
        <span className="rounded-full bg-error/10 px-2 py-0.5 text-xs font-semibold text-error">Desactivado</span>
      ) : (
        <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">Activo</span>
      ),
  }),
  columnHelper.display({
    id: 'acciones',
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row, table }) => {
      const usuario = row.original
      // En la fila propia no se muestra Desactivar (el backend igual responde 400)
      if (usuario.id === table.options.meta?.usuarioActualId) return null
      return (
        <div className="flex justify-end">
          <Button
            variant={usuario.disabled ? 'primary' : 'danger'}
            className="px-3 py-1"
            disabled={table.options.meta?.procesando}
            onClick={() => table.options.meta?.onToggle?.(usuario)}
          >
            {usuario.disabled ? 'Activar' : 'Desactivar'}
          </Button>
        </div>
      )
    },
  }),
]
const sinDatos: Usuario[] = []

const AdminUsuariosPage = () => {
  const usuarioActualId = useAuthStore((s) => s.usuario?.id)
  const [sorting, setSorting] = useState<SortingState>([])

  const { data, isPending, error, refetch } = useUsuarios()
  const cambiarEstado = useCambiarEstadoUsuario()

  const table = useReactTable({
    data: data ?? sinDatos,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    autoResetPageIndex: false,
    initialState: { pagination: { pageSize: 8 } },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      usuarioActualId,
      procesando: cambiarEstado.isPending,
      onToggle: (u) => cambiarEstado.mutate({ id: u.id, activar: u.disabled }),
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
        <p className="text-sm text-gray-500">{data?.length ?? 0} usuarios registrados</p>
      </div>

      <ErrorApi mensaje={cambiarEstado.error ? handleApiError(cambiarEstado.error) : null} />

      {isPending ? (
        <Skeleton />
      ) : error ? (
        <EstadoError error={error} onRetry={() => refetch()} />
      ) : (
        <DataTable table={table} />
      )}
    </div>
  )
}

export default AdminUsuariosPage
