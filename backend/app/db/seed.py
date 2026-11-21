# Carga el admin, categorias y productos. Se puede correr varias veces sin duplicar.
# Uso (desde backend/): python -m app.db.seed
from sqlmodel import Session, select

from app.core.config import settings
from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.main import app  # noqa: F401  registra todos los modelos
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

CATEGORIAS = [
    ("Pizzas", "Pizzas a la piedra"),
    ("Hamburguesas", "Hamburguesas con papas"),
    ("Bebidas", "Gaseosas, aguas y jugos"),
]

# (categoria, nombre, descripcion, precio, stock)
PRODUCTOS = [
    ("Pizzas", "Pizza muzzarella", "Salsa de tomate, muzzarella y aceitunas", 9500, 20),
    ("Pizzas", "Pizza napolitana", "Muzzarella, tomate en rodajas y ajo", 10500, 15),
    ("Pizzas", "Pizza fugazzeta", "Muzzarella y cebolla", 10000, 10),
    ("Hamburguesas", "Hamburguesa clásica", "Carne, lechuga, tomate y queso", 8500, 25),
    ("Hamburguesas", "Hamburguesa doble", "Doble carne, cheddar y panceta", 11000, 12),
    ("Hamburguesas", "Hamburguesa veggie", "Medallón de lentejas y vegetales", 9000, 8),
    ("Bebidas", "Gaseosa 500 ml", "Línea cola", 2000, 50),
    ("Bebidas", "Agua mineral 500 ml", "Sin gas", 1500, 40),
]


def imagen(nombre: str) -> str:
    # Imagen de ejemplo con el nombre del producto
    return f"https://placehold.co/400x300?text={nombre.replace(' ', '+')}"


def cargar_admin(session: Session) -> None:
    if not settings.ADMIN_PASSWORD:
        print("  [!] Falta ADMIN_PASSWORD en el .env: no se crea el admin")
        return
    if session.exec(select(Usuario).where(Usuario.username == settings.ADMIN_USERNAME)).first():
        print(f"  [=] El admin {settings.ADMIN_USERNAME} ya existe")
        return
    session.add(
        Usuario(
            username=settings.ADMIN_USERNAME,
            full_name="Administrador",
            email=f"{settings.ADMIN_USERNAME}@foodstore.com",
            hashed_password=hash_password(settings.ADMIN_PASSWORD),
            role="admin",
        )
    )
    print(f"  [+] Admin {settings.ADMIN_USERNAME}")


def cargar_categorias(session: Session) -> dict[str, Categoria]:
    categorias = {}
    for nombre, descripcion in CATEGORIAS:
        categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
        if categoria is None:
            categoria = Categoria(nombre=nombre, descripcion=descripcion)
            session.add(categoria)
            session.flush()
            print(f"  [+] Categoría {nombre}")
        categorias[nombre] = categoria
    return categorias


def cargar_productos(session: Session, categorias: dict[str, Categoria]) -> None:
    for categoria, nombre, descripcion, precio, stock in PRODUCTOS:
        if session.exec(select(Producto).where(Producto.nombre == nombre)).first():
            continue
        session.add(
            Producto(
                categoria_id=categorias[categoria].id,
                nombre=nombre,
                descripcion=descripcion,
                precio_base=precio,
                imagen_url=imagen(nombre),
                stock=stock,
            )
        )
        print(f"  [+] Producto {nombre}")


def run() -> None:
    print("Seed Food Store")
    create_all_tables()
    with Session(engine) as session:
        cargar_admin(session)
        cargar_productos(session, cargar_categorias(session))
        session.commit()
    print("Listo")


if __name__ == "__main__":
    run()
