const pesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })

export const formatearPrecio = (valor: number): string => pesos.format(valor)

export const formatearFecha = (iso: string): string =>
  new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
