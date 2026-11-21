export type Rol = 'user' | 'admin'

// Mismos campos que UserPublic del backend (sin hashed_password)
export interface Usuario {
  id: number
  username: string
  full_name: string
  email: string
  role: Rol
  disabled: boolean
  created_at: string
}

// Lo que guarda authStore: solo lo que usa la interfaz, nunca el token
export interface UsuarioSesion {
  id: number
  username: string
  nombre: string
  email: string
  rol: Rol
}

export interface RegisterData {
  username: string
  full_name: string
  email: string
  password: string
}
