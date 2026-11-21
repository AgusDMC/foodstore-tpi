import type { ReactNode } from 'react'

interface ModalProps {
  abierto: boolean
  titulo: string
  children: ReactNode
  ancho?: 'md' | 'lg'
}

// Contenedor comun de los modales. Si abierto es false no renderiza nada
const Modal = ({ abierto, titulo, children, ancho = 'md' }: ModalProps) => {
  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={`flex max-h-[90vh] w-full flex-col gap-4 overflow-y-auto rounded-lg bg-white p-6 shadow-xl ${ancho === 'lg' ? 'max-w-2xl' : 'max-w-md'}`}
      >
        <h2 className="text-xl font-bold text-gray-800">{titulo}</h2>
        {children}
      </div>
    </div>
  )
}

export default Modal
