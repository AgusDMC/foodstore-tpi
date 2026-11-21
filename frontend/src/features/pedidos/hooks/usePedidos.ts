import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNotificationStore } from '@/store/notificationStore'
import {
  cambiarEstadoPedido,
  cancelarPedido,
  crearPedido,
  getPedido,
  getPedidos,
  getResumen,
  type FiltrosPedidos,
} from '../api/pedidos'

export const usePedidos = (filtros: FiltrosPedidos) =>
  useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => getPedidos(filtros),
    placeholderData: keepPreviousData,
  })

// enabled: solo consulta cuando hay un pedido elegido
export const usePedido = (id: number | null) =>
  useQuery({
    queryKey: ['pedidos', 'detalle', id],
    queryFn: () => getPedido(id as number),
    enabled: id !== null,
  })

export const useResumenPedidos = () => useQuery({ queryKey: ['resumen'], queryFn: getResumen })

// Un pedido nuevo o cancelado cambia el stock: tambien se invalidan los productos
const useInvalidarPedidos = () => {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['pedidos'] })
    queryClient.invalidateQueries({ queryKey: ['productos'] })
    queryClient.invalidateQueries({ queryKey: ['resumen'] })
  }
}

export function useCrearPedido() {
  const invalidar = useInvalidarPedidos()
  const notificar = useNotificationStore((s) => s.notificar)
  return useMutation({
    mutationFn: crearPedido,
    onSuccess: (pedido) => {
      invalidar()
      notificar(`Pedido #${pedido.id} confirmado.`)
    },
  })
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarPedidos()
  const notificar = useNotificationStore((s) => s.notificar)
  return useMutation({
    mutationFn: cambiarEstadoPedido,
    onSuccess: (pedido) => {
      invalidar()
      notificar(`Pedido #${pedido.id} pasó a ${pedido.estado.replace('_', ' ')}.`)
    },
  })
}

export function useCancelarPedido() {
  const invalidar = useInvalidarPedidos()
  const notificar = useNotificationStore((s) => s.notificar)
  return useMutation({
    mutationFn: cancelarPedido,
    onSuccess: (pedido) => {
      invalidar()
      notificar(`Pedido #${pedido.id} cancelado.`)
    },
  })
}
