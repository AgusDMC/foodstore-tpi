import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { handleApiError } from '@/shared/api/handleApiError'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import ErrorApi from '@/shared/ui/ErrorApi'
import Input from '@/shared/ui/Input'
import { useAuthStore } from '@/store/authStore'

const requerido = (campo: string) => ({ value }: { value: string }) =>
  value.trim() ? undefined : `${campo} es obligatorio`

// Login con TanStack Form. Si sale bien, LoginPage ve el usuario y redirige
export function LoginForm() {
  const login = useAuthStore((s) => s.login)
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await login(value.username.trim(), value.password)
      } catch (e) {
        // 401 credenciales incorrectas o 400 cuenta desactivada: se muestra el detail
        setError(handleApiError(e))
      }
    },
  })

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

        <form.Field name="username" validators={{ onChange: requerido('El usuario') }}>
          {(field) => (
            <Input
              label="Usuario"
              autoComplete="username"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              errores={field.state.meta.errors}
            />
          )}
        </form.Field>

        <form.Field name="password" validators={{ onChange: requerido('La contraseña') }}>
          {(field) => (
            <Input
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              errores={field.state.meta.errors}
            />
          )}
        </form.Field>

        {/* isSubmitting: evita el doble envio mientras responde la API */}
        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(enviando) => (
            <Button type="submit" disabled={enviando}>
              {enviando ? 'Ingresando...' : 'Ingresar'}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </Card>
  )
}
