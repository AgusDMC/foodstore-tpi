from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router

# Se importan todos los modelos para que create_all y las relaciones los conozcan
from app.modules.categorias.models import Categoria  # noqa: F401
from app.modules.pedidos.models import DetallePedido, Pedido  # noqa: F401
from app.modules.productos.models import Producto  # noqa: F401
from app.modules.usuarios.models import Usuario  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Al arrancar crea las tablas que todavia no existen
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description="Trabajo Práctico Integrador - Programación 4",
    version="1.0.0",
    lifespan=lifespan,
)

# Con cookies el origen tiene que ser explicito ("*" no se admite con credenciales)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (auth_router, usuarios_router, categorias_router, productos_router, pedidos_router):
    app.include_router(router, prefix="/api/v1")
