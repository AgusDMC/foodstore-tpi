import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ItemCarrito } from '@/features/pedidos/types/pedido'

interface CartState {
  items: ItemCarrito[]
  agregar: (item: Omit<ItemCarrito, 'cantidad'>) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
}

// Persistido en localStorage: el carrito sobrevive a la recarga y no necesita sesion
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // Si ya estaba suma 1; asi no se repite el producto (RN-01)
      agregar: (item) =>
        set((s) => {
          const existe = s.items.some((i) => i.producto_id === item.producto_id)
          return {
            items: existe
              ? s.items.map((i) => (i.producto_id === item.producto_id ? { ...i, cantidad: i.cantidad + 1 } : i))
              : [...s.items, { ...item, cantidad: 1 }],
          }
        }),

      quitar: (productoId) => set((s) => ({ items: s.items.filter((i) => i.producto_id !== productoId) })),

      // Minimo 1: para sacarlo esta quitar
      cambiarCantidad: (productoId, cantidad) =>
        set((s) => ({
          items: s.items.map((i) => (i.producto_id === productoId ? { ...i, cantidad: Math.max(1, cantidad) } : i)),
        })),

      vaciar: () => set({ items: [] }),

      // Se calcula, no se guarda: no puede quedar desfasado de los items
      total: () => get().items.reduce((suma, i) => suma + i.precio_unitario * i.cantidad, 0),
    }),
    { name: 'cart-storage', partialize: (s) => ({ items: s.items }) },
  ),
)
