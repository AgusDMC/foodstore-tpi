export interface Categoria {
  id: number
  nombre: string
  descripcion: string | null
  activo: boolean
}

// Body de POST y PUT
export interface CategoriaData {
  nombre: string
  descripcion: string | null
}
