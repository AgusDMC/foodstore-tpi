import { useState } from 'react'
import { useCategorias } from '@/features/categorias/hooks/useCategorias'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Paginacion from '@/shared/components/Paginacion'
import Skeleton from '@/shared/components/Skeleton'
import Button from '@/shared/ui/Button'
import { inputClass } from '@/shared/ui/Input'
import ProductoCard from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const POR_PAGINA = 8

const CatalogoPage = () => {
  const [pagina, setPagina] = useState(0)
  // texto: lo que se escribe; busqueda: lo que se envio con "Buscar"
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)

  const { data: categorias } = useCategorias()
  // Paginacion del servidor: skip = pagina x limit
  const { data, isPending, isFetching, error, refetch } = useProductos({
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
    search: busqueda || undefined,
    categoria_id: categoriaId,
  })

  const totalPaginas = data ? Math.ceil(data.total / POR_PAGINA) : 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Catálogo</h1>
        <p className="text-sm text-gray-500">{data ? `${data.total} productos` : 'Cargando productos...'}</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          // Un filtro nuevo vuelve a la primera pagina
          setBusqueda(texto.trim())
          setPagina(0)
        }}
        className="flex flex-wrap gap-2"
      >
        <input
          type="search"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Buscar por nombre..."
          aria-label="Buscar por nombre"
          className={`${inputClass} min-w-48 flex-1`}
        />
        <select
          value={categoriaId ?? ''}
          onChange={(e) => {
            setCategoriaId(e.target.value ? Number(e.target.value) : undefined)
            setPagina(0)
          }}
          aria-label="Filtrar por categoría"
          className={inputClass}
        >
          <option value="">Todas las categorías</option>
          {categorias?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <Button type="submit">Buscar</Button>
      </form>

      {isPending ? (
        <Skeleton variante="grilla" filas={POR_PAGINA} />
      ) : error ? (
        <EstadoError error={error} onRetry={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio mensaje="No hay productos que coincidan con la búsqueda." />
      ) : (
        <>
          {/* Opacidad mientras llega la pagina nueva (se ve la anterior) */}
          <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${isFetching ? 'opacity-60' : ''}`}>
            {data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
        </>
      )}
    </div>
  )
}

export default CatalogoPage
