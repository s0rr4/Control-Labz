# Web — Control de Laboratorios UTR

Interfaz React + Vite para consumir la API compartida del sistema.

## Instalación

```bash
cd web
npm install
copy .env.example .env
npm run dev
```

Configura `VITE_API_URL` y `VITE_API_APP_TOKEN`.

## Build de producción

```bash
npm run build
npm run preview
```

La aplicación incluye login, registro, laboratorio con asignación modal, sesión activa, liberación de equipo y panel administrativo protegido por rol.
