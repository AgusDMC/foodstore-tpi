import Button from './Button'
import ErrorApi from './ErrorApi'
import Modal from './Modal'

interface ConfirmDialogProps {
  abierto: boolean
  titulo: string
  mensaje: string
  textoConfirmar: string
  procesando: boolean
  error: string | null
  onConfirm: () => void
  onCancel: () => void
}

// Confirmacion de acciones destructivas. Si la API falla queda abierto y muestra el error
const ConfirmDialog = ({ abierto, titulo, mensaje, textoConfirmar, procesando, error, onConfirm, onCancel }: ConfirmDialogProps) => (
  <Modal abierto={abierto} titulo={titulo}>
    <p className="text-sm text-gray-600">{mensaje}</p>
    <ErrorApi mensaje={error} />
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={onCancel} disabled={procesando}>
        Volver
      </Button>
      <Button variant="danger" onClick={onConfirm} disabled={procesando}>
        {procesando ? 'Procesando...' : textoConfirmar}
      </Button>
    </div>
  </Modal>
)

export default ConfirmDialog
