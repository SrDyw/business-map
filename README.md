# Business Map

Directorio georreferenciado de negocios para Cuba, tipo "Google Maps + Marketplace". Los negocios se registran, publican productos con precios, y los clientes buscan productos viendo los resultados en un mapa interactivo con comparativa de precios, distancias y rutas.

## Caracteristicas

- Mapa interactivo con MapLibre GL + OpenStreetMap.
- Registro de negocios con seleccion de ubicacion en el mapa.
- Catalogo de productos con precios, unidades y metodos de pago.
- Buscador global de productos con autocompletado (atajo `Enter`).
- Visualizacion de la ruta desde tu ubicacion hasta el negocio seleccionado.
- Autenticacion con correo/contrasena y Google OAuth (NextAuth v5 + Prisma Adapter).
- Panel administrativo para gestion de usuarios, negocios y productos.
- UI oscura con acento verde menta (`#4CD9A0`).

## Stack

- Next.js 16 (App Router) como monolito full-stack.
- TypeScript estricto.
- Prisma ORM 7 con SQLite (driver adapter `better-sqlite3`).
- NextAuth v5 para autenticacion.
- MapLibre GL + OpenStreetMap.
- TailwindCSS 4 + shadcn/ui.
- Zod para validacion.

## Estructura

```
.
├── app/                # App Router (rutas, server components, API)
├── components/         # UI modular por dominio (business, search, map, auth, admin)
├── lib/                # Servicios, db client, utilidades, validaciones
│   └── generated/      # Cliente Prisma generado (no editar)
├── prisma/             # Schema, migraciones y seeds
├── hooks/              # Hooks reutilizables
└── types/              # Tipos compartidos
```

## Instalacion y arranque

La guia completa de instalacion, configuracion de variables de entorno, setup de Prisma y creacion del usuario administrador esta en [SETUP.md](./SETUP.md).

Resumen rapido:

```bash
npm install
cp .env.example .env   # editar valores (ver SETUP.md)
npm run db:migrate
npm run db:seed
npm run dev
```

App disponible en `http://localhost:3000`.

## Scripts

| Script               | Descripcion                                       |
| -------------------- | ------------------------------------------------- |
| `npm run dev`        | Servidor de desarrollo.                           |
| `npm run build`      | Build de produccion.                              |
| `npm run start`      | Servidor de produccion (requiere `build` previo). |
| `npm run lint`       | Ejecuta ESLint sobre todo el proyecto.            |
| `npm run db:generate`| Regenera el cliente Prisma.                       |
| `npm run db:migrate` | Aplica migraciones y crea `dev.db`.               |
| `npm run db:push`    | Sincroniza el schema sin generar migracion.       |
| `npm run db:studio`  | Abre Prisma Studio.                               |
| `npm run db:seed`    | Puebla la base con datos de ejemplo.              |

## API

Endpoints REST bajo `/api/v1/`. Validacion con Zod en todos los inputs. Respuestas en formato `{ success: true, data }` o `{ success: false, error }`.

## Licencia

Privado. Todos los derechos reservados.
