import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primary' | 'secondary' | 'outline' | 'danger'

// Extiende los atributos nativos: acepta onClick, disabled, type, etc.
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variante
}

const clases: Record<Variante, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover',
  secondary: 'bg-secondary text-white hover:opacity-90',
  outline: 'border border-brand text-brand hover:bg-brand/10',
  danger: 'bg-error text-white hover:opacity-90',
}

// type="button" por defecto: dentro de un form no lo envia sin querer
const Button = ({ variant = 'primary', type = 'button', className = '', children, ...props }: ButtonProps) => (
  <button
    type={type}
    className={`rounded-md px-4 py-2 text-sm font-semibold transition active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 ${clases[variant]} ${className}`}
    {...props}
  >
    {children}
  </button>
)

export default Button
