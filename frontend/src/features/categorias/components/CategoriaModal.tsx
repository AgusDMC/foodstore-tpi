import { useForm } from '@tanstack/react-form'
import Button from '@/shared/ui/Button'
import ErrorApi from '@/shared/ui/ErrorApi'
import Input, { ErroresCampo, inputClass, labelClass } from '@/shared/ui/Input'
import Modal from '@/shared/ui/Modal'
import type { Categoria, CategoriaData } from '../types/categoria'

interface CategoriaModalProps {
  // null = alta
  categoria: Categoria | null
  guardando: boolean
  error: string | null
  onGuardar: (data: CategoriaData) => void
  onClose: () => void
}

// Mismas reglas que el backend: 2 a 100 caracteres sin contar espacios de los extremos
const validarNombre = ({ value }: { value: string }) => {
  const nombre = value.trim()
  if (nombre.length < 2) return 'Mínimo 2 caracteres'
  if (nombre.length > 100) return 'Máximo 100 caracteres'
  return undefined
}

// Se monta con key: cada apertura arranca con los valores de esa categoria
const CategoriaModal = ({ categoria, guardando, error, onGuardar, onClose }: CategoriaModalProps) => {
  const form = useForm({
    defaultValues: { nombre: categoria?.nombre ?? '', descripcion: categoria?.descripcion ?? '' },
    onSubmit: ({ value }) => onGuardar({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null }),
  })

  return (
    <Modal abierto titulo={categoria ? 'Editar categoría' : 'Nueva categoría'}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="flex flex-col gap-4"
      >
        <ErrorApi mensaje={error} />

        <form.Field name="nombre" validators={{ onChange: validarNombre }}>
          {(field) => (
            <Input
              label="Nombre"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Ej: Pizzas"
              disabled={guardando}
              errores={field.state.meta.errors}
            />
          )}
        </form.Field>

        <form.Field name="descripcion">
          {(field) => (
            <label className={labelClass}>
              Descripción (opcional)
              <textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                rows={3}
                disabled={guardando}
                className={inputClass}
              />
              <ErroresCampo errores={field.state.meta.errors} />
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

export default CategoriaModal
