import { NavLink, useNavigate } from 'react-router-dom'
import Button from '@/shared/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-gray-100'}`

const linksAdmin = [
  { to: '/admin/resumen', texto: 'Resumen' },
  { to: '/admin/categorias', texto: 'Categorías' },
  { to: '/admin/productos', texto: 'Productos' },
  { to: '/admin/pedidos', texto: 'Pedidos' },
  { to: '/admin/usuarios', texto: 'Usuarios' },
]

// Links segun la sesion: el panel solo lo ve el admin (la ruta igual esta protegida)
const Navbar = () => {
  const navigate = useNavigate()
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidad = useCartStore((s) => s.items.reduce((suma, i) => suma + i.cantidad, 0))

  const cerrarSesion = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <NavLink to="/" className="text-xl font-bold text-brand">
          Food Store
        </NavLink>

        <ul className="flex flex-wrap gap-1">
          <li>
            <NavLink to="/" end className={linkClass}>
              Catálogo
            </NavLink>
          </li>
          <li>
            <NavLink to="/carrito" className={linkClass}>
              Carrito{cantidad > 0 && ` (${cantidad})`}
            </NavLink>
          </li>
          {usuario && (
            <li>
              <NavLink to="/mis-pedidos" className={linkClass}>
                Mis pedidos
              </NavLink>
            </li>
          )}
          {usuario?.rol === 'admin' &&
            linksAdmin.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} className={linkClass}>
                  {link.texto}
                </NavLink>
              </li>
            ))}
        </ul>

        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <div className="text-right text-sm leading-tight">
                <p className="font-semibold text-gray-800">{usuario.nombre}</p>
                <p className="text-xs text-gray-500">Rol: {usuario.rol}</p>
              </div>
              <Button variant="outline" onClick={cerrarSesion}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Ingresar
              </NavLink>
              <NavLink to="/register" className={linkClass}>
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
