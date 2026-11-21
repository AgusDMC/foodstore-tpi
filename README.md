# Food Store - Trabajo Práctico Integrador

Programación 4 - Tecnicatura Universitaria en Programación a Distancia (UTN)
Alumno: Agustín Echeverría

Aplicación web para un negocio de comidas: los clientes se registran, recorren el catálogo, arman un carrito y confirman pedidos; el administrador gestiona categorías, productos, stock, pedidos y usuarios desde un panel.

- **Repositorio:** https://github.com/AgusDMC/foodstore-tpi
- **Video de demostración:** https://drive.google.com/file/d/10yj4k_IfYy8wujIgluWDTyaIhh9G_Ybo/view?usp=sharing

## Tecnologías

| Parte | Stack |
|---|---|
| Backend | Python 3.13, FastAPI, SQLModel, PostgreSQL (psycopg2), python-jose (JWT), Passlib + bcrypt, pydantic-settings |
| Frontend | React 19 + TypeScript (strict), Vite, Tailwind CSS 4, TanStack Query / Form / Table, React Router 7, Zustand, Axios |

## Requisitos

- Python **3.11 a 3.13** (SQLModel no funciona con 3.14)
- PostgreSQL 15 o superior
- Node.js 20.19 o superior y pnpm 9 o superior

## Estructura

```
backend/
  app/
    main.py            FastAPI, CORS con credenciales y routers bajo /api/v1
    core/              config, database, security, deps, unit_of_work, base_repository
    modules/
      auth/            router, service, schemas (registro, login con cookie, logout, /me)
      usuarios/        models, schemas, repository, unit_of_work, service, router (admin)
      categorias/      models, schemas, repository, unit_of_work, service, router
      productos/       models, schemas, repository, unit_of_work, service, router
      pedidos/         models, schemas, repository, unit_of_work, service, router
    db/seed.py         carga admin, categorías y productos (idempotente)
  tests/*.http         pruebas manuales de la API (REST Client de VS Code)
  requirements.txt
  .env.example
frontend/
  src/
    shared/            api (axiosInstance, handleApiError, queryClient), ui, components, layout
    features/          auth, categorias, productos, usuarios, pedidos (pages, components, hooks, api, types)
    store/             authStore y cartStore (Zustand + persist), notificationStore
    routes/            AppRouter y ProtectedRoute
  package.json
  .env.example
```

## Instalación y ejecución

### 1. Base de datos

Crear la base vacía (las tablas las crea la aplicación):

```bash
psql -U postgres -h localhost -c "CREATE DATABASE foodstore_db;"
```

### 2. Backend (puerto 8000)

```bash
cd backend
python3.13 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # completar DATABASE_URL y SECRET_KEY
python -m app.db.seed
uvicorn app.main:app --reload
```

- Documentación de la API: http://localhost:8000/docs y http://localhost:8000/redoc
- Pruebas manuales: `backend/tests/` (auth, categorias, productos y pedidos, en ese orden y sobre una base recién creada).

### 3. Frontend (puerto 5173)

En otra terminal:

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm build      # verifica los tipos
pnpm dev
```

Abrir http://localhost:5173

## Variables de entorno

**backend/.env**

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://postgres:clave@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Firma del JWT, mínimo 32 caracteres | `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración de la cookie y del token | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Usuario admin que crea el seed | `admin` / `Admin1234!` |

**frontend/.env**

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

## Usuario del seed

`python -m app.db.seed` se puede ejecutar varias veces sin duplicar datos. Crea:

- Administrador: usuario **admin**, contraseña **Admin1234!**
- 3 categorías (Pizzas, Hamburguesas, Bebidas) y 8 productos con stock.

Los clientes se crean desde la pantalla de registro (rol `user`).

## Reglas de negocio implementadas

- **RN-01** El pedido se crea en una sola transacción (Unit of Work): valida productos activos, disponibles, con stock y sin repetir, descuenta el stock y copia nombre y precio en cada línea.
- **RN-02** Máquina de estados: PENDIENTE → EN_PREPARACION → ENTREGADO, y CANCELADO desde PENDIENTE o EN_PREPARACION. Una transición inválida responde 400.
- **RN-03** Cancelar restituye el stock en la misma transacción.
- **RN-04** El cliente ve y cancela solo sus pedidos (y solo en PENDIENTE); el admin ve todos y avanza o cancela.
- **RN-05** Las líneas y el total no cambian después de crear el pedido; los pedidos no se borran.
- **RN-06** `forma_pago` EFECTIVO o TRANSFERENCIA y `direccion_entrega` de 5 a 200 caracteres.
