import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import { formatearPrecio } from '@/shared/utils/formato'
import { useCartStore } from '@/store/cartStore'
import type { Producto } from '../types/producto'

// Tarjeta del catalogo. Solo se puede agregar si esta disponible y con stock
const ProductoCard = ({ producto }: { producto: Producto }) => {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0)
  const sinStock = producto.stock <= enCarrito
  const vendible = producto.disponible && !sinStock

  return (
    <Card className="flex flex-col gap-3">
      {producto.imagen_url ? (
        <img src={producto.imagen_url} alt={producto.nombre} className="h-40 w-full rounded-md bg-gray-100 object-cover" loading="lazy" />
      ) : (
        <div className="flex h-40 items-center justify-center rounded-md bg-gray-100 text-sm text-gray-400">Sin imagen</div>
      )}
      <div className="flex flex-1 flex-col gap-1">
        <span className="text-xs font-medium text-brand">{producto.categoria.nombre}</span>
        <h3 className="font-semibold text-gray-800">{producto.nombre}</h3>
        {producto.descripcion && <p className="text-sm text-gray-500">{producto.descripcion}</p>}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-gray-900">{formatearPrecio(producto.precio_base)}</span>
        <span className="text-xs text-gray-500">Stock: {producto.stock}</span>
      </div>
      <Button
        disabled={!vendible}
        onClick={() => agregar({ producto_id: producto.id, nombre: producto.nombre, precio_unitario: producto.precio_base })}
      >
        {!producto.disponible ? 'No disponible' : sinStock ? 'Sin stock' : 'Agregar al carrito'}
      </Button>
      {enCarrito > 0 && <p className="text-center text-xs text-gray-500">{enCarrito} en el carrito</p>}
    </Card>
  )
}

export default ProductoCard
