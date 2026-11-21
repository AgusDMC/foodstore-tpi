const colores: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  EN_PREPARACION: 'bg-blue-100 text-blue-800',
  ENTREGADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800',
}

// Colorea los cuatro estados del pedido
const BadgeEstado = ({ estado }: { estado: string }) => (
  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${colores[estado] ?? 'bg-gray-100 text-gray-700'}`}>
    {estado.replace('_', ' ')}
  </span>
)

export default BadgeEstado
