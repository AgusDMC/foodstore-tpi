import { Outlet } from 'react-router-dom'
import Toast from '@/shared/components/Toast'
import Navbar from './Navbar'

// Navbar arriba y la pantalla de la ruta (Outlet) debajo
const MainLayout = () => (
  <div className="min-h-screen bg-gray-50 text-gray-900">
    <Navbar />
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Outlet />
    </main>
    <Toast />
  </div>
)

export default MainLayout
