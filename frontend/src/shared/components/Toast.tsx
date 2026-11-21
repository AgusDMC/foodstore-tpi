import { useEffect } from 'react'
import { useNotificationStore } from '@/store/notificationStore'

// Aviso de exito. Se monta una sola vez en MainLayout y se oculta a los 3 segundos
const Toast = () => {
  const mensaje = useNotificationStore((s) => s.mensaje)
  const id = useNotificationStore((s) => s.id)
  const ocultar = useNotificationStore((s) => s.ocultar)

  useEffect(() => {
    if (!mensaje) return
    const timer = setTimeout(ocultar, 3000)
    // Un aviso nuevo (id distinto) cancela el temporizador anterior
    return () => clearTimeout(timer)
  }, [mensaje, id, ocultar])

  if (!mensaje) return null

  return (
    <div role="status" className="fixed right-4 bottom-4 z-30 max-w-sm rounded-md bg-success px-4 py-3 text-sm font-medium text-white shadow-lg">
      {mensaje}
    </div>
  )
}

export default Toast
