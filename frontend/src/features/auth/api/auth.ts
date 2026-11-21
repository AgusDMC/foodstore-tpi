import { api } from '@/shared/api/axiosInstance'
import type { RegisterData, Usuario } from '../types/auth'

// Formulario OAuth2: el backend responde con la cookie HttpOnly, el body no trae el token
export const login = async (username: string, password: string): Promise<void> => {
  const form = new URLSearchParams({ username, password })
  await api.post('/auth/token', form)
}

export const register = async (data: RegisterData): Promise<Usuario> =>
  (await api.post<Usuario>('/auth/register', data)).data

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout')
}

export const getMe = async (): Promise<Usuario> => (await api.get<Usuario>('/auth/me')).data
