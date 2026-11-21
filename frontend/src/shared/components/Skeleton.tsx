interface SkeletonProps {
  filas?: number
  // grilla: tarjetas del catalogo; lista: filas de una tabla
  variante?: 'lista' | 'grilla'
}

// Anticipa la forma del contenido mientras llegan los datos
const Skeleton = ({ filas = 4, variante = 'lista' }: SkeletonProps) => {
  const items = Array.from({ length: filas }, (_, i) => i)

  if (variante === 'grilla') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Cargando">
        {items.map((n) => (
          <div key={n} className="h-72 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Cargando">
      {items.map((n) => (
        <div key={n} className="h-12 animate-pulse rounded-md bg-gray-200" />
      ))}
    </div>
  )
}

export default Skeleton
