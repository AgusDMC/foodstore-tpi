import { QueryClient } from '@tanstack/react-query'
import axios from 'axios'

// Un 4xx no se arregla reintentando: solo se reintentan errores de red o 5xx
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (intentos, error) => {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined
        if (status && status < 500) return false
        return intentos < 2
      },
    },
  },
})
