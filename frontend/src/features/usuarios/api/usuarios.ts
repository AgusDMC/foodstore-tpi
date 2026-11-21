import type { Usuario } from '@/features/auth/types/auth'
import { api } from '@/shared/api/axiosInstance'

export const getUsuarios = async (): Promise<Usuario[]> => (await api.get<Usuario[]>('/admin/usuarios')).data

// activar / desactivar: idempotentes, responden el usuario actualizado
export const cambiarEstadoUsuario = async ({ id, activar }: { id: number; activar: boolean }): Promise<Usuario> =>
  (await api.post<Usuario>(`/admin/usuarios/${id}/${activar ? 'activar' : 'desactivar'}`)).data
