# Guia de instalacion y configuracion

Esta guia cubre todo lo necesario para levantar el proyecto en local desde cero: dependencias, variables de entorno, base de datos con Prisma, seeds y arranque.

## Requisitos previos

- **Node.js** >= 20
- **npm** (incluido con Node)
- **Git**
- Windows, macOS o Linux

Verifica tu version de Node:

```bash
node --version
```

## 1. Clonar e instalar dependencias

```bash
git clone <url-del-repositorio>
cd business-map
npm install
```

## 2. Configurar variables de entorno

Copia el archivo de ejemplo y editalo con tus valores:

```bash
cp .env.example .env
```

En Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

Variables requeridas en `.env`:

```env
# Base de datos SQLite (ruta relativa al proyecto)
DATABASE_URL="file:./dev.db"

# Secreto de NextAuth (genera uno con: openssl rand -base64 32)
AUTH_SECRET="genera-un-secreto-seguro-aqui"
AUTH_TRUST_HOST="true"

# Google OAuth (opcional, solo si quieres login con Google)
# Crea credenciales en https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### Generar AUTH_SECRET

```bash
openssl rand -base64 32
```

Copia el resultado y pegalo como valor de `AUTH_SECRET` en `.env`.

### Configurar Google OAuth (opcional)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Crea un proyecto (si no tienes uno).
3. Habilita la API de Google Identity.
4. Crea credenciales de tipo "OAuth 2.0 Client ID" (Web application).
5. Agrega estas URIs de redireccion:
   - `http://localhost:3000/api/auth/callback/google` (desarrollo)
   - `https://tu-dominio.com/api/auth/callback/google` (produccion)
6. Copia `Client ID` y `Client Secret` a tu `.env`.

Si no configuras Google OAuth, la app seguira funcionando con autenticacion por correo/contrasena.

## 3. Configurar Prisma y la base de datos

El proyecto usa Prisma 7 con SQLite y el driver adapter `better-sqlite3`. El cliente se genera en `lib/generated/prisma/` (no editar manualmente).

### 3.1 Generar el cliente Prisma

Si clonas el repositorio por primera vez o cambias el schema:

```bash
npm run db:generate
```

### 3.2 Aplicar migraciones

Crea la base de datos SQLite (`prisma/dev.db`) y aplica todas las migraciones:

```bash
npm run db:migrate
```

Esto ejecuta `prisma migrate dev`, que:
- Crea `dev.db` si no existe.
- Aplica todas las migraciones pendientes de `prisma/migrations/`.
- Regenera el cliente Prisma.

### 3.3 (Opcional) Inspeccionar la base de datos

Abre Prisma Studio para ver y editar datos visualmente:

```bash
npm run db:studio
```

Disponible en `http://localhost:5555`.

## 4. Poblar la base con datos de ejemplo

El script `prisma/seed.ts` crea categorias, negocios y productos de muestra:

```bash
npm run db:seed
```

> Nota: este script borra los negocios y productos existentes antes de insertar. No lo ejecutes en produccion.

## 5. Crear el usuario administrador

El usuario administrador se crea con un script separado. Corre esto una sola vez despues de aplicar las migraciones:

```bash
npx tsx prisma/seed-admin.ts
```

Esto crea el usuario:

- Email: `admin@businessmap.cu`
- Contrasena: `Admin123!`
- Rol: `admin`

> Cambia la contrasena inmediatamente despues del primer inicio de sesion.

## 6. Arrancar el proyecto

### Modo desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Build de produccion

```bash
npm run build
npm run start
```

## Flujo completo (TL;DR)

```bash
git clone <url>
cd business-map
npm install
cp .env.example .env
# editar .env con tu AUTH_SECRET y credenciales de Google si aplica

npm run db:generate
npm run db:migrate
npm run db:seed
npx tsx prisma/seed-admin.ts

npm run dev
```

## Solucion de problemas

### Error: "Cannot find module '../lib/generated/prisma/client'"

El cliente Prisma no esta generado. Ejecuta:

```bash
npm run db:generate
```

### Error: "Environment variable not found: DATABASE_URL"

Falta el archivo `.env` o no tiene la variable `DATABASE_URL`. Verifica que `.env` existe en la raiz y que la variable esta definida.

### Error: "Prisma migrate dev" falla por schema desactualizado

Si el schema cambio pero hay migraciones locales sin aplicar, borra la base de datos y reaplica:

```bash
rm prisma/dev.db
npm run db:migrate
npm run db:seed
npx tsx prisma/seed-admin.ts
```

### Error de OAuth con Google en desarrollo

Verifica que `AUTH_TRUST_HOST="true"` esta en `.env` y que la URI de redireccion en Google Cloud Console coincide exactamente con `http://localhost:3000/api/auth/callback/google`.

### Reinicio limpio de la base de datos

```bash
rm prisma/dev.db
npm run db:migrate
npm run db:seed
npx tsx prisma/seed-admin.ts
```

## Variables de entorno (referencia)

| Variable              | Requerida | Descripcion                                            |
| --------------------- | --------- | ------------------------------------------------------ |
| `DATABASE_URL`        | Si        | URL de conexion a SQLite. Default: `file:./dev.db`.    |
| `AUTH_SECRET`         | Si        | Secreto para firmar tokens JWT de NextAuth.            |
| `AUTH_TRUST_HOST`     | Si        | `true` para confiar en el host en desarrollo.          |
| `GOOGLE_CLIENT_ID`    | No        | Client ID de Google OAuth.                             |
| `GOOGLE_CLIENT_SECRET`| No        | Client Secret de Google OAuth.                        |

## Estructura de la base de datos

Modelos principales (ver `prisma/schema.prisma` para detalle):

- **User**: usuarios del sistema, con rol (`user` | `admin`) y estado activo.
- **Account / Session / VerificationToken**: tablas de NextAuth.
- **Business**: negocios registrados con coordenadas geograficas.
- **Product**: productos publicados por un negocio, con precio y unidad.
- **Category**: categorias de productos.
- **BusinessPaymentMethod / ProductPaymentMethod**: metodos de pago aceptados.

## Notas adicionales

- El cliente Prisma se genera en `lib/generated/prisma/` (incluido en `.gitignore`).
- El archivo `prisma/dev.db` es local y no se commitea.
- Las migraciones viven en `prisma/migrations/` y son parte del repositorio.
- El archivo `prisma.config.ts` centraliza configuracion de Prisma (incluye el seed).
