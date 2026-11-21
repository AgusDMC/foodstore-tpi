import { api } from '@/shared/api/axiosInstance'
import type { Categoria, CategoriaData } from '../types/categoria'

export const getCategorias = async (): Promise<Categoria[]> => (await api.get<Categoria[]>('/categorias')).data

export const crearCategoria = async (data: CategoriaData): Promise<Categoria> =>
  (await api.post<Categoria>('/categorias', data)).data

export const editarCategoria = async ({ id, data }: { id: number; data: CategoriaData }): Promise<Categoria> =>
  (await api.put<Categoria>(`/categorias/${id}`, data)).data

// 204 sin cuerpo: baja logica en el backend
export const eliminarCategoria = async (id: number): Promise<void> => {
  await api.delete(`/categorias/${id}`)
}
