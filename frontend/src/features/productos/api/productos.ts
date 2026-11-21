import { api } from '@/shared/api/axiosInstance'
import type { FiltrosProductos, Producto, ProductoData, ProductosPaginados, ProductoStockData } from '../types/producto'

// Axios omite los params undefined: solo viajan los filtros cargados
export const getProductos = async (filtros: FiltrosProductos): Promise<ProductosPaginados> =>
  (await api.get<ProductosPaginados>('/productos', { params: filtros })).data

export const crearProducto = async (data: ProductoData): Promise<Producto> =>
  (await api.post<Producto>('/productos', data)).data

export const editarProducto = async ({ id, data }: { id: number; data: ProductoData }): Promise<Producto> =>
  (await api.put<Producto>(`/productos/${id}`, data)).data

export const editarStock = async ({ id, data }: { id: number; data: ProductoStockData }): Promise<Producto> =>
  (await api.patch<Producto>(`/productos/${id}/stock`, data)).data

export const eliminarProducto = async (id: number): Promise<void> => {
  await api.delete(`/productos/${id}`)
}
