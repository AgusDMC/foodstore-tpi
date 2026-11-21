import { useForm } from '@tanstack/react-form'
import { useCategorias } from '@/features/categorias/hooks/useCategorias'
import Button from '@/shared/ui/Button'
import ErrorApi from '@/shared/ui/ErrorApi'
import Input, { ErroresCampo, inputClass, labelClass } from '@/shared/ui/Input'
import Modal from '@/shared/ui/Modal'
import type { Producto, ProductoData } from '../types/producto'

interface ProductoModalProps {
  // null = alta
  producto: Producto | null
  guardando: boolean
  error: string | null
  onGuardar: (data: ProductoData) => void
  onClose: () => void
}

const validarNombre = ({ value }: { value: string }) =>
  value.trim().length < 2 ? 'Mínimo 2 caracteres' : undefined
// NaN: el input numerico quedo vacio
const noNegativo = ({ value }: { value: number }) =>
  Number.isNaN(value) ? 'Obligatorio' : value < 0 ? 'No puede ser negativo' : undefined
const stockValido = ({ value }: { value: number }) =>
  noNegativo({ value }) ?? (Number.isInteger(value) ? undefined : 'Debe ser un número entero')
const validarCategoria = ({ value }: { value: number }) => (value ? undefined : 'Elegí una categoría')

// Se monta con key: cada apertura arranca con los valores de ese producto
const ProductoModal = ({ producto, guardando, error, onGuardar, onClose }: ProductoModalProps) => {
  const { data: categorias } = useCategorias()

  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto?.precio_base ?? 0,
      imagen_url: producto?.imagen_url ?? '',
      stock: producto?.stock ?? 0,
      disponible: producto?.disponible ?? true,
      // 0 = sin elegir
      categoria_id: producto?.categoria_id ?? 0,
    },
    onSubmit: ({ value }) =>
      onGuardar({
        ...value,
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        imagen_url: value.imagen_url.trim() || null,
      }),
  })

  return (
    <Modal abierto titulo={producto ? 'Editar producto' : 'Nuevo producto'} ancho="lg">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <ErrorApi mensaje={error} />
        </div>

        <form.Field name="nombre" validators={{ onChange: validarNombre }}>
          {(field) => (
            <Input
              label="Nombre"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={guardando}
              errores={field.state.meta.errors}
            />
          )}
        </form.Field>

        <form.Field name="categoria_id" validators={{ onChange: validarCategoria }}>
          {(field) => (
            <label className={labelClass}>
              Categoría
              <select
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                disabled={guardando}
                className={inputClass}
              >
                <option value={0}>Elegir...</option>
                {categorias?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              <ErroresCampo errores={field.state.meta.errors} />
            </label>
          )}
        </form.Field>

        <form.Field name="precio_base" validators={{ onChange: noNegativo }}>
          {(field) => (
            <Input
              label="Precio"
              type="number"
              min={0}
              step="0.01"
              value={Number.isNaN(field.state.value) ? '' : field.state.value}
              onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              disabled={guardando}
              errores={field.state.meta.errors}
            />
          )}
        </form.Field>

        <form.Field name="stock" validators={{ onChange: stockValido }}>
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

        <form.Field name="imagen_url">
          {(field) => (
            <Input
              label="URL de la imagen (opcional)"
              type="url"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="https://..."
              disabled={guardando}
              className="w-full"
            />
          )}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-gray-700">
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

        <form.Field name="descripcion">
          {(field) => (
            <label className={`${labelClass} sm:col-span-2`}>
              Descripción (opcional)
              <textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                rows={2}
                disabled={guardando}
                className={inputClass}
              />
            </label>
          )}
        </form.Field>

        <div className="flex justify-end gap-2 sm:col-span-2">
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

export default ProductoModal
