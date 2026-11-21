import Card from '@/shared/ui/Card'

interface TarjetaResumenProps {
  titulo: string
  valor: string | number
  color?: string
}

// Un indicador del panel de resumen
const TarjetaResumen = ({ titulo, valor, color = 'text-gray-900' }: TarjetaResumenProps) => (
  <Card className="flex flex-col gap-1">
    <span className="text-sm text-gray-500">{titulo}</span>
    <span className={`text-3xl font-bold ${color}`}>{valor}</span>
  </Card>
)

export default TarjetaResumen
