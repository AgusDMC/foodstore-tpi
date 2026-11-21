import { useForm } from '@tanstack/react-form'
import Button from '@/shared/ui/Button'
import ErrorApi from '@/shared/ui/ErrorApi'
import Input from '@/shared/ui/Input'
import Modal from '@/shared/ui/Modal'
import type { Producto, ProductoStockData } from '../types/producto'

interface StockModalProps {
  producto: Producto
  guardando: boolean
  error: string | null
  onGuardar: (data: ProductoStockData) => void
  onClose: () => void
}

const validarStock = ({ value }: { value: number }) => {
  if (Number.isNaN(value)) return 'Obligatorio'
  if (value < 0 || !Number.isInteger(value)) return 'Debe ser un entero mayor o igual a 0'
  return undefined
}

// Cambio rapido de stock y disponibilidad (PATCH /productos/{id}/stock)
const StockModal = ({ producto, guardando, error, onGuardar, onClose }: StockModalProps) => {
  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible },
    onSubmit: ({ value }) => onGuardar(value),
  })

  return (
    <Modal abierto titulo={`Stock de ${producto.nombre}`}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="flex flex-col gap-4"
      >
        <ErrorApi mensaje={error} />

        <form.Field name="stock" validators={{ onChange: validarStock }}>
          {(field) => (
            <Input
              label="Stock"
              type="number"
              min={0}
              step={1}
              value={Number.isNaN(field.state.value) ? '' : field.state.value}
              onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              disabled={guardando}
              errores={field.state.meta.errors}
            />
          )}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                disabled={guardando}
                className="size-4 accent-brand"
              />
              Disponible para la venta
            </label>
          )}
        </form.Field>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default StockModal
