import { Link, Navigate, useLocation, type Location } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { RegisterForm } from '../components/RegisterForm'

const RegisterPage = () => {
  const usuario = useAuthStore((s) => s.usuario)
  const location = useLocation()
  const destino = (location.state as { from?: Location } | null)?.from?.pathname ?? '/'

  // Al registrarse inicia sesion y vuelve a la pantalla que se habia pedido
  if (usuario) return <Navigate to={destino} replace />

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Crear cuenta</h1>
        <p className="text-sm text-gray-500">Registrate para hacer pedidos.</p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-gray-600">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" state={location.state} className="font-semibold text-brand hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </div>
  )
}

export default RegisterPage
