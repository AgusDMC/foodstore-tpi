import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  // Errores de TanStack Form (field.state.meta.errors)
  errores?: Array<string | undefined>
}

export const inputClass =
  'rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none disabled:bg-gray-100'

export const labelClass = 'flex flex-col gap-1 text-sm font-medium text-gray-700'

// Set: si onChange y onBlur dan el mismo mensaje se muestra una sola vez
export const ErroresCampo = ({ errores = [] }: { errores?: Array<string | undefined> }): ReactNode =>
  [...new Set(errores.filter(Boolean))].map((mensaje) => (
    <span key={mensaje} className="text-xs font-normal text-error">
      {mensaje}
    </span>
  ))

// Label + input + errores del campo
const Input = ({ label, errores, className = '', ...props }: InputProps) => (
  <label className={labelClass}>
    {label}
    <input className={`${inputClass} ${className}`} {...props} />
    <ErroresCampo errores={errores} />
  </label>
)

export default Input
