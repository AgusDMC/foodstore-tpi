import { useEffect } from 'react'
import { AppRouter } from '@/routes/AppRouter'
import { useAuthStore } from '@/store/authStore'

function App() {
  const checkSession = useAuthStore((s) => s.checkSession)

  // Unica llamada en un useEffect: confirma con /auth/me si la cookie sigue valida
  useEffect(() => {
    checkSession()
  }, [checkSession])

  return <AppRouter />
}

export default App
