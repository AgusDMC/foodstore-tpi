import { flexRender, type Table } from '@tanstack/react-table'
import Paginacion from './Paginacion'

const flechas: Record<string, string> = { asc: ' ▲', desc: ' ▼' }

// Dibuja cualquier tabla de TanStack Table: encabezados ordenables, filas y paginacion del cliente.
// Las columnas, el orden y la paginacion los arma la pagina con useReactTable
const DataTable = <T,>({ table }: { table: Table<T> }) => (
  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-600">
          {table.getHeaderGroups().map((grupo) => (
            <tr key={grupo.id}>
              {grupo.headers.map((header) => (
                <th key={header.id} className="border-b border-gray-200 px-4 py-3 font-semibold whitespace-nowrap">
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <button type="button" onClick={header.column.getToggleSortingHandler()} className="flex items-center gap-1 hover:text-brand">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {flechas[header.column.getIsSorted() as string] ?? null}
                    </button>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 align-middle text-gray-700">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
      <Paginacion
        pagina={table.getState().pagination.pageIndex}
        totalPaginas={table.getPageCount()}
        onCambiar={(pagina) => table.setPageIndex(pagina)}
      />
    </div>
  </div>
)

export default DataTable
