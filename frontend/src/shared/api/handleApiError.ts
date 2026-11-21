import axios from 'axios'

// Convierte el detail de la API en un mensaje para la pantalla.
// FastAPI responde {"detail": "texto"} en 400/403/404/409 y {"detail": [...]} en 422
export function handleApiError(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'Error inesperado.'
  if (error.code === 'ECONNABORTED') return 'El servidor tardó demasiado en responder.'
  if (!error.response) return 'No se pudo conectar con el servidor.'

  const { status, data } = error.response
  const detail = (data as { detail?: unknown } | undefined)?.detail

  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    // 422: se juntan los mensajes de cada campo
    return detail.map((d: { msg?: string }) => d.msg ?? 'Dato inválido').join(', ')
  }
  if (status === 401) return 'La sesión venció. Iniciá sesión de nuevo.'
  if (status < 500) return 'No se pudo completar la operación.'
  return 'Error del servidor. Intentá nuevamente más tarde.'
}
