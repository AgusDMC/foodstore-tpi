import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNotificationStore } from '@/store/notificationStore'
import { crearProducto, editarProducto, editarStock, eliminarProducto, getProductos } from '../api/productos'
import type { FiltrosProductos } from '../types/producto'

// Los filtros forman parte de la key: cada combinacion tiene su propia cache
export const useProductos = (filtros: FiltrosProductos) =>
  useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => getProductos(filtros),
    // Mientras carga la pagina siguiente se sigue viendo la anterior
    placeholderData: keepPreviousData,
  })

export function useProductoMutations() {
  const queryClient = useQueryClient()
  const notificar = useNotificationStore((s) => s.notificar)

  // ['productos'] invalida todas las combinaciones de filtros
  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['productos'] })

  const crear = useMutation({
    mutationFn: crearProducto,
    onSuccess: () => {
      invalidar()
      notificar('Producto creado.')
    },
  })

  const editar = useMutation({
    mutationFn: editarProducto,
    onSuccess: () => {
      invalidar()
      notificar('Producto actualizado.')
    },
  })

  const stock = useMutation({
    mutationFn: editarStock,
    onSuccess: () => {
      invalidar()
      notificar('Stock actualizado.')
    },
  })

  const eliminar = useMutation({
    mutationFn: eliminarProducto,
    onSuccess: () => {
      invalidar()
      notificar('Producto dado de baja.')
    },
  })

  return { crear, editar, stock, eliminar }
}
