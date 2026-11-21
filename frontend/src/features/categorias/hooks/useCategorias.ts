import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNotificationStore } from '@/store/notificationStore'
import { crearCategoria, editarCategoria, eliminarCategoria, getCategorias } from '../api/categorias'

export const CATEGORIAS_KEY = ['categorias']

// Lectura publica: la usan el catalogo (filtro) y los formularios del admin
export const useCategorias = () => useQuery({ queryKey: CATEGORIAS_KEY, queryFn: getCategorias })

// Altas, ediciones y bajas del admin. Al terminar se invalida el listado
export function useCategoriaMutations() {
  const queryClient = useQueryClient()
  const notificar = useNotificationStore((s) => s.notificar)

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: CATEGORIAS_KEY })
    // Los productos muestran el nombre de su categoria
    queryClient.invalidateQueries({ queryKey: ['productos'] })
  }

  const crear = useMutation({
    mutationFn: crearCategoria,
    onSuccess: () => {
      invalidar()
      notificar('Categoría creada.')
    },
  })

  const editar = useMutation({
    mutationFn: editarCategoria,
    onSuccess: () => {
      invalidar()
      notificar('Categoría actualizada.')
    },
  })

  const eliminar = useMutation({
    mutationFn: eliminarCategoria,
    onSuccess: () => {
      invalidar()
      notificar('Categoría dada de baja.')
    },
  })

  return { crear, editar, eliminar }
}
