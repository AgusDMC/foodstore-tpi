import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as authApi from '@/features/auth/api/auth'
import type { Rol, Usuario, UsuarioSesion } from '@/features/auth/types/auth'
import { queryClient } from '@/shared/api/queryClient'

interface AuthState {
  usuario: UsuarioSesion | null
  // true hasta que responde /auth/me al montar la app
  cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiarSesion: () => void
  tieneRol: (...roles: Rol[]) => boolean
}

const aSesion = (u: Usuario): UsuarioSesion => ({
  id: u.id,
  username: u.username,
  nombre: u.full_name,
  email: u.email,
  rol: u.role,
})

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      cargando: true,

      // Si falla, el error lo muestra el formulario de login
      login: async (username, password) => {
        await authApi.login(username, password)
        set({ usuario: aSesion(await authApi.getMe()), cargando: false })
      },

      logout: async () => {
        try {
          // El servidor borra la cookie: limpiar solo el store no cierra la sesion
          await authApi.logout()
        } finally {
          get().limpiarSesion()
        }
      },

      // La cookie decide: el usuario guardado en el navegador puede estar vencido
      checkSession: async () => {
        try {
          set({ usuario: aSesion(await authApi.getMe()), cargando: false })
        } catch {
          get().limpiarSesion()
        }
      },

      limpiarSesion: () => {
        set({ usuario: null, cargando: false })
        // Borra los datos del usuario anterior. reset y no clear: las consultas montadas
        // (ej. el catalogo) se vuelven a pedir en lugar de quedar colgadas
        queryClient.resetQueries()
      },

      tieneRol: (...roles) => {
        const usuario = get().usuario
        return usuario !== null && roles.includes(usuario.rol)
      },
    }),
    {
      name: 'auth-storage',
      // Solo el usuario: cargando no se guarda y el token nunca pasa por JavaScript
      partialize: (s) => ({ usuario: s.usuario }),
    },
  ),
)
