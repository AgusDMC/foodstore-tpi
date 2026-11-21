import Button from '@/shared/ui/Button'

interface PaginacionProps {
  // pagina arranca en 0
  pagina: number
  totalPaginas: number
  onCambiar: (pagina: number) => void
}

// Anterior / Siguiente: sirve para la paginacion del servidor y la de TanStack Table
const Paginacion = ({ pagina, totalPaginas, onCambiar }: PaginacionProps) => (
  <nav aria-label="Paginación" className="flex items-center justify-between gap-4">
    <Button variant="outline" onClick={() => onCambiar(pagina - 1)} disabled={pagina === 0}>
      Anterior
    </Button>
    {/* || 1 evita "Pagina 1 de 0" */}
    <span className="text-sm text-gray-600">
      Página {pagina + 1} de {totalPaginas || 1}
    </span>
    <Button variant="outline" onClick={() => onCambiar(pagina + 1)} disabled={pagina + 1 >= totalPaginas}>
      Siguiente
    </Button>
  </nav>
)

export default Paginacion
