import { Link, Navigate, useLocation, type Location } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { LoginForm } from '../components/LoginForm'

const LoginPage = () => {
  const usuario = useAuthStore((s) => s.usuario)
  const location = useLocation()
  // ProtectedRoute guarda en state.from la pantalla que se pidio sin sesion
  const destino = (location.state as { from?: Location } | null)?.from?.pathname ?? '/'

  if (usuario) return <Navigate to={destino} replace />

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Iniciar sesión</h1>
        <p className="text-sm text-gray-500">Ingresá con tu usuario y contraseña.</p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-gray-600">
        ¿No tenés cuenta?{' '}
        {/* state: si venia del checkout, despues de registrarse vuelve ahi */}
        <Link to="/register" state={location.state} className="font-semibold text-brand hover:underline">
          Registrate
        </Link>
      </p>
    </div>
  )
}

export default LoginPage
