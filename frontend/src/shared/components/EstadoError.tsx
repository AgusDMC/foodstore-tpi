import { handleApiError } from '@/shared/api/handleApiError'
import Button from '@/shared/ui/Button'

interface EstadoErrorProps {
  error: unknown
  onRetry: () => void
}

// Error al cargar un listado: mensaje de la API y opcion de reintentar
const EstadoError = ({ error, onRetry }: EstadoErrorProps) => (
  <div role="alert" className="flex flex-col items-start gap-3 rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error">
    <p>No se pudieron cargar los datos: {handleApiError(error)}</p>
    <Button variant="outline" onClick={onRetry}>
      Reintentar
    </Button>
  </div>
)

export default EstadoError
