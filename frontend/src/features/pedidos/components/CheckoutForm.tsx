import { useForm } from '@tanstack/react-form'
import Button from '@/shared/ui/Button'
import ErrorApi from '@/shared/ui/ErrorApi'
import { ErroresCampo, inputClass, labelClass } from '@/shared/ui/Input'
import type { FormaPago } from '../types/pedido'

export interface DatosCheckout {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string | null
}

interface CheckoutFormProps {
  enviando: boolean
  error: string | null
  onConfirmar: (datos: DatosCheckout) => void
}

// RN-06: misma regla que el schema del backend
const validarDireccion = ({ value }: { value: string }) => {
  const largo = value.trim().length
  if (largo < 5) return 'La dirección debe tener al menos 5 caracteres'
  if (largo > 200) return 'Máximo 200 caracteres'
  return undefined
}

// Datos de entrega y pago con TanStack Form
const CheckoutForm = ({ enviando, error, onConfirmar }: CheckoutFormProps) => {
  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' },
    onSubmit: ({ value }) =>
      onConfirmar({
        direccion_entrega: value.direccion_entrega.trim(),
        forma_pago: value.forma_pago,
        notas: value.notas.trim() || null,
      }),
  })

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="flex flex-col gap-4"
    >
      <ErrorApi mensaje={error} />

      <form.Field name="direccion_entrega" validators={{ onChange: validarDireccion }}>
        {(field) => (
          <label className={labelClass}>
            Dirección de entrega
            <input
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Calle, número, piso"
              disabled={enviando}
              className={inputClass}
            />
            <ErroresCampo errores={field.state.meta.errors} />
          </label>
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <fieldset className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            <legend className="mb-1">Forma de pago</legend>
            {(['EFECTIVO', 'TRANSFERENCIA'] as const).map((opcion) => (
              <label key={opcion} className="flex items-center gap-2 font-normal">
                <input
                  type="radio"
                  name="forma_pago"
                  checked={field.state.value === opcion}
                  onChange={() => field.handleChange(opcion)}
                  disabled={enviando}
                  className="accent-brand"
                />
                {opcion === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}
              </label>
            ))}
          </fieldset>
        )}
      </form.Field>

      <form.Field name="notas">
        {(field) => (
          <label className={labelClass}>
            Notas (opcional)
            <textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              rows={2}
              placeholder="Ej: tocar timbre"
              disabled={enviando}
              className={inputClass}
            />
          </label>
        )}
      </form.Field>

      <Button type="submit" disabled={enviando}>
        {enviando ? 'Confirmando...' : 'Confirmar pedido'}
      </Button>
    </form>
  )
}

export default CheckoutForm
