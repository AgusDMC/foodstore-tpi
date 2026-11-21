import { Link } from 'react-router-dom'

const UnauthorizedPage = () => (
  <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
    <h1 className="text-2xl font-bold text-gray-800">Sin permiso</h1>
    <p className="text-gray-600">No tenés permisos para ver esta pantalla.</p>
    <Link to="/" className="font-semibold text-brand hover:underline">
      Volver al inicio
    </Link>
  </div>
)

export default UnauthorizedPage
