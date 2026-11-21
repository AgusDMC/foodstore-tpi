// Error que devolvio la API al guardar o al ejecutar una accion
const ErrorApi = ({ mensaje }: { mensaje: string | null }) => {
  if (!mensaje) return null

  return (
    <p role="alert" className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
      {mensaje}
    </p>
  )
}

export default ErrorApi
