import axios, { type AxiosError } from 'axios'
import { useAuthStore } from '@/store/authStore'

// Instancia unica para toda la app: baseURL y cookies en un solo lugar
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  // El navegador manda la cookie HttpOnly del login en cada peticion
  withCredentials: true,
})

// En el login un 401 es "credenciales incorrectas" y /auth/me ya lo maneja checkSession
const RUTAS_DE_AUTH = ['/auth/token', '/auth/me']

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: unknown }>) => {
    const url = error.config?.url ?? ''
    const status = error.response?.status
    const sesionVencida = status === 401 && !RUTAS_DE_AUTH.some((ruta) => url.includes(ruta))
    const cuentaDesactivada =
      status === 400 && error.response?.data?.detail === 'Cuenta de usuario desactivada'

    if (sesionVencida || cuentaDesactivada) {
      // Sin usuario en el store, ProtectedRoute lleva al login
      useAuthStore.getState().limpiarSesion()
    }
    // Se propaga: el hook o la pantalla tambien puede mostrar el error
    return Promise.reject(error)
  },
)
