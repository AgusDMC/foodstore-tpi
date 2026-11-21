import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { handleApiError } from '@/shared/api/handleApiError'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import ErrorApi from '@/shared/ui/ErrorApi'
import Input from '@/shared/ui/Input'
import { useAuthStore } from '@/store/authStore'
import { register } from '../api/auth'

type Validador = ({ value }: { value: string }) => string | undefined

// Mismas reglas que UserCreate del backend
const validarUsername: Validador = ({ value }) => {
  const v = value.trim()
  if (!v) return 'El usuario es obligatorio'
  if (v.length < 3 || v.length > 50) return 'Entre 3 y 50 caracteres'
  if (/\s/.test(v)) return 'Sin espacios'
  return undefined
}
const validarNombre: Validador = ({ value }) =>
  value.trim().length < 2 ? 'Ingresá tu nombre completo' : undefined
const validarEmail: Validador = ({ value }) =>
  /^\S+@\S+\.\S+$/.test(value.trim()) ? undefined : 'El email no es válido'
const validarPassword: Validador = ({ value }) =>
  value.length < 8 ? 'Mínimo 8 caracteres' : undefined

// Registro con TanStack Form. Despues de registrarse inicia sesion solo
export function RegisterForm() {
  const login = useAuthStore((s) => s.login)
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await register({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        })
        // Con el usuario en el store, RegisterPage redirige al catalogo
        await login(value.username.trim(), value.password)
      } catch (e) {
        // 409 usuario o email repetido
        setError(handleApiError(e))
      }
    },
  })

  const campos = [
    { name: 'username', label: 'Usuario', validar: validarUsername, type: 'text', auto: 'username' },
    { name: 'full_name', label: 'Nombre completo', validar: validarNombre, type: 'text', auto: 'name' },
    { name: 'email', label: 'Email', validar: validarEmail, type: 'email', auto: 'email' },
    { name: 'password', label: 'Contraseña', validar: validarPassword, type: 'password', auto: 'new-password' },
  ] as const

  return (
    <Card>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="flex flex-col gap-4"
      >
        <ErrorApi mensaje={error} />

        {campos.map((c) => (
          <form.Field key={c.name} name={c.name} validators={{ onChange: c.validar }}>
            {(field) => (
              <Input
                label={c.label}
                type={c.type}
                autoComplete={c.auto}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                errores={field.state.meta.errors}
              />
            )}
          </form.Field>
        ))}

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(enviando) => (
            <Button type="submit" disabled={enviando}>
              {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </Card>
  )
}
