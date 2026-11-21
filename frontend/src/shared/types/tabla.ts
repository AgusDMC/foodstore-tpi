import type { RowData } from '@tanstack/react-table'

// Tipa el meta de useReactTable: las columnas se definen fuera del componente
// y llaman a estas funciones sin recibirlas por closure
declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    onEdit?: (fila: TData) => void
    onDelete?: (fila: TData) => void
    onStock?: (fila: TData) => void
    onVer?: (fila: TData) => void
    onCambiarEstado?: (fila: TData, estado: string) => void
    onToggle?: (fila: TData) => void
    usuarioActualId?: number
    procesando?: boolean
  }
}
