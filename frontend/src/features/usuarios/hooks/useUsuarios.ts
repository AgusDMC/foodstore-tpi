import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNotificationStore } from '@/store/notificationStore'
import { cambiarEstadoUsuario, getUsuarios } from '../api/usuarios'

const USUARIOS_KEY = ['usuarios']

export const useUsuarios = () => useQuery({ queryKey: USUARIOS_KEY, queryFn: getUsuarios })

export function useCambiarEstadoUsuario() {
  const queryClient = useQueryClient()
  const notificar = useNotificationStore((s) => s.notificar)

  return useMutation({
    mutationFn: cambiarEstadoUsuario,
    onSuccess: (usuario) => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_KEY })
      notificar(`Usuario ${usuario.username} ${usuario.disabled ? 'desactivado' : 'activado'}.`)
    },
  })
}
