import { Link, Navigate, useNavigate } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import Card from '@/shared/ui/Card'
import { formatearPrecio } from '@/shared/utils/formato'
import { useCartStore } from '@/store/cartStore'
import CheckoutForm, { type DatosCheckout } from '../components/CheckoutForm'
import { useCrearPedido } from '../hooks/usePedidos'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const vaciar = useCartStore((s) => s.vaciar)
  const crear = useCrearPedido()

  // Sin items no hay nada que confirmar (salvo que el pedido se acabe de crear)
  if (items.length === 0 && !crear.isSuccess) return <Navigate to="/carrito" replace />

  const confirmar = (datos: DatosCheckout) => {
    crear.mutate(
      { ...datos, items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })) },
      {
        onSuccess: () => {
          vaciar()
          navigate('/mis-pedidos')
        },
      },
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Confirmar pedido</h1>
        <Card>
          {/* Errores del backend: stock insuficiente, producto no disponible, etc. */}
          <CheckoutForm enviando={crear.isPending} error={crear.error ? handleApiError(crear.error) : null} onConfirmar={confirmar} />
        </Card>
      </div>

      <Card className="flex h-fit flex-col gap-3">
        <h2 className="font-semibold text-gray-800">Resumen</h2>
        {items.map((i) => (
          <div key={i.producto_id} className="flex justify-between text-sm">
            <span>
              {i.cantidad} x {i.nombre}
            </span>
            <span>{formatearPrecio(i.precio_unitario * i.cantidad)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-gray-200 pt-3 font-bold">
          <span>Total</span>
          <span>{formatearPrecio(total)}</span>
        </div>
        <Link to="/carrito" className="text-sm text-brand hover:underline">
          Modificar carrito
        </Link>
      </Card>
    </div>
  )
}

export default CheckoutPage
