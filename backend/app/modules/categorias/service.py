from .models import Categoria
from .schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .unit_of_work import CategoriaUnitOfWork


# Excepciones de dominio: el service no sabe de HTTP, el router las traduce
class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def _activa_o_error(self, uow: CategoriaUnitOfWork, id: int) -> Categoria:
        # Una categoria dada de baja se trata como inexistente
        categoria = uow.categorias.get_by_id(id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(f"Categoría {id} no encontrada")
        return categoria

    def _validar_nombre(self, uow: CategoriaUnitOfWork, nombre: str, id: int | None = None):
        existente = uow.categorias.get_by_nombre(nombre)
        if existente and existente.id != id:
            raise NombreDuplicado(f"Ya existe una categoría llamada '{existente.nombre}'")

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.listar_activas()]

    def obtener(self, id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._activa_o_error(uow, id))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            self._validar_nombre(uow, data.nombre)
            categoria = uow.categorias.add(Categoria.model_validate(data))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, id: int, data: CategoriaUpdate) -> CategoriaRead:
        # exclude_none: un null enviado no pisa el valor guardado
        cambios = data.model_dump(exclude_unset=True, exclude_none=True)
        with self.uow as uow:
            categoria = self._activa_o_error(uow, id)
            if "nombre" in cambios:
                self._validar_nombre(uow, cambios["nombre"], id)
            categoria.sqlmodel_update(cambios)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, id: int) -> None:
        # Baja logica: no oculta sus productos (se dan de baja aparte)
        with self.uow as uow:
            categoria = self._activa_o_error(uow, id)
            categoria.activo = False
            uow.categorias.add(categoria)
