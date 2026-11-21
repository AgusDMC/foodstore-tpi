import EstadoError from '@/shared/components/EstadoError'
import Skeleton from '@/shared/components/Skeleton'
import { formatearPrecio } from '@/shared/utils/formato'
import TarjetaResumen from '../components/TarjetaResumen'
import { useResumenPedidos } from '../hooks/usePedidos'

const AdminResumenPage = () => {
  const { data, isPending, error, refetch } = useResumenPedidos()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-800">Resumen</h1>

      {isPending ? (
        <Skeleton variante="grilla" filas={4} />
      ) : error ? (
        <EstadoError error={error} onRetry={() => refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TarjetaResumen titulo="Pendientes" valor={data.pendientes} color="text-yellow-600" />
          <TarjetaResumen titulo="En preparación" valor={data.en_preparacion} color="text-blue-600" />
          <TarjetaResumen titulo="Entregados" valor={data.entregados} color="text-green-600" />
          <TarjetaResumen titulo="Cancelados" valor={data.cancelados} color="text-red-600" />
          <TarjetaResumen titulo="Pedidos de hoy" valor={data.pedidos_hoy} />
          <TarjetaResumen titulo="Ingresos (entregados)" valor={formatearPrecio(data.ingresos_entregados)} />
        </div>
      )}
    </div>
  )
}

export default AdminResumenPage
