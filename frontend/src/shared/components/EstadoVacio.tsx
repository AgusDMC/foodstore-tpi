import type { ReactNode } from 'react'

// Lista vacia: explica que no hay datos en lugar de mostrar una tabla en blanco
const EstadoVacio = ({ mensaje, children }: { mensaje: string; children?: ReactNode }) => (
  <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
    <p>{mensaje}</p>
    {children}
  </div>
)

export default EstadoVacio
