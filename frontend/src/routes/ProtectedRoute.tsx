import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Rol } from '@/features/auth/types/auth'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  // Sin roles alcanza con tener sesion
  roles?: Rol[]
}

// Ruta padre de las protegidas. La proteccion real esta en el backend (require_role)
const ProtectedRoute = ({ roles }: ProtectedRouteProps) => {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)
  const location = useLocation()

  // Mientras checkSession confirma la cookie no se decide nada
  if (cargando) return <p className="p-8 text-center text-sm text-gray-500">Verificando sesión...</p>
  // from: despues del login vuelve a la pantalla pedida
  if (!usuario) return <Navigate to="/login" replace state={{ from: location }} />
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/unauthorized" replace />

  return <Outlet />
}

export default ProtectedRoute
