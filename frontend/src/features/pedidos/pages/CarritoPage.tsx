import { Link } from 'react-router-dom'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import { inputClass } from '@/shared/ui/Input'
import { formatearPrecio } from '@/shared/utils/formato'
import { useCartStore } from '@/store/cartStore'

// Publico: el carrito vive en el navegador. La sesion se pide recien en el checkout
const CarritoPage = () => {
  const items = useCartStore((s) => s.items)
  const quitar = useCartStore((s) => s.quitar)
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const vaciar = useCartStore((s) => s.vaciar)
  const total = useCartStore((s) => s.total())

  if (items.length === 0) {
    return (
      <EstadoVacio mensaje="Tu carrito está vacío.">
        <Link to="/" className="font-semibold text-brand hover:underline">
          Ir al catálogo
        </Link>
      </EstadoVacio>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-800">Carrito</h1>

      <Card className="flex flex-col divide-y divide-gray-100 p-0">
        {items.map((item) => (
          <div key={item.producto_id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-40 flex-1">
              <p className="font-semibold text-gray-800">{item.nombre}</p>
              <p className="text-sm text-gray-500">{formatearPrecio(item.precio_unitario)} c/u</p>
            </div>
            <input
              type="number"
              min={1}
              value={item.cantidad}
              onChange={(e) => cambiarCantidad(item.producto_id, e.target.valueAsNumber || 1)}
              aria-label={`Cantidad de ${item.nombre}`}
              className={`${inputClass} w-20`}
            />
            <p className="w-28 text-right font-semibold">{formatearPrecio(item.precio_unitario * item.cantidad)}</p>
            <Button variant="outline" className="px-3 py-1" onClick={() => quitar(item.producto_id)}>
              Quitar
            </Button>
          </div>
        ))}
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="outline" onClick={vaciar}>
          Vaciar carrito
        </Button>
        <div className="flex items-center gap-4">
          <p className="text-xl font-bold">Total: {formatearPrecio(total)}</p>
          <Link to="/checkout" className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">
            Continuar al checkout
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CarritoPage
