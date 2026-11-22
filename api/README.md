# API — Sistema de Control de Laboratorios UTR

API REST en Node.js, Express y MongoDB para autenticación, laboratorios, equipos y asignaciones.

## Instalación

```bash
cd api
npm install
copy .env.example .env
```

Configura `MONGO_URI`, `JWT_SECRET` y `APP_TOKEN` en `.env`.

Para operar en modo transaccional, MongoDB debe ejecutarse como replica set. Esto garantiza consistencia entre asignaciones y estados de computadora.

```bash
npm run dev
```

## Seguridad

Todas las solicitudes deben enviar:

```text
x-api-token: <APP_TOKEN>
```

Las rutas protegidas requieren además:

```text
Authorization: Bearer <JWT>
```

El registro público siempre asigna el rol `USER`; solo un `ADMIN` puede cambiar roles.

## Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/verify` (verificación adicional del JWT)
- `GET /api/users`
- `PATCH /api/users/:id/role`
- `GET /api/labs/computers`
- `POST /api/labs/computers`
- `POST /api/labs/equipment`
- `POST /api/labs/assignments`
- `GET /api/labs/assignments`
- `PATCH /api/labs/assignments/:id/release`

Al liberar por falla se conserva el reporte en la asignación y la computadora vuelve a `DISPONIBLE`. El sistema no cambia automáticamente a `MANTENIMIENTO`, porque el contrato no define una regla técnica para determinar cuándo una falla requiere mantenimiento.
