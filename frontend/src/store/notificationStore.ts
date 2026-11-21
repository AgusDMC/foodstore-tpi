import { create } from 'zustand'

interface NotificationState {
  mensaje: string | null
  // Cambia en cada aviso: reinicia el temporizador aunque se repita el texto
  id: number
  notificar: (mensaje: string) => void
  ocultar: () => void
}

// Solo avisos de exito; los errores se muestran en la misma pantalla
export const useNotificationStore = create<NotificationState>()((set) => ({
  mensaje: null,
  id: 0,
  notificar: (mensaje) => set((s) => ({ mensaje, id: s.id + 1 })),
  ocultar: () => set({ mensaje: null }),
}))
