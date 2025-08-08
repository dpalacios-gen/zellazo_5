## Relevant Files

- `backend/.env.example` - Variables iniciales (`BASE_URL`, `DB_URL`, `SES_*`, `GOOGLE_*`, `FACEBOOK_*`, etc.).
- `backend/start/routes.ts` - Rutas HTTP de AdonisJS para auth, cuponera, QR, sellos, canjes, reportes.
- `backend/app/Models/User.ts` - Modelo de usuario con roles `ADMIN` y `CLIENTE` y verificación de email.
- `backend/app/Models/Local.ts` - Modelo de local 1:1 con usuario admin.
- `backend/app/Models/Cuponera.ts` - Modelo de cuponera del local (única por local).
- `backend/app/Models/Cupon.ts` - Modelo de cupón del cliente por local.
- `backend/app/Models/QrToken.ts` - Modelo para tokens de QR de un solo uso (STAMP/REDEEM) con TTL y estado.
- `backend/app/Models/Evento.ts` - Modelo para historial de eventos (sellos, canjes, asignación de cupón).
- `backend/app/Controllers/Http/AuthController.ts` - Registro/login, verificación email, recuperación, OAuth.
- `backend/app/Controllers/Http/CuponerasController.ts` - CRUD limitado de cuponera (crear/editar) y reglas.
- `backend/app/Controllers/Http/AsignacionController.ts` - Flujo de asignar cupón via QR de local.
- `backend/app/Controllers/Http/StampsController.ts` - Generar QR de sellos, validar token y otorgar sellos.
- `backend/app/Controllers/Http/RedeemController.ts` - Generar QR de canje, validar token y ejecutar canje.
- `backend/app/Controllers/Http/ReportsController.ts` - Endpoints de reportes con filtros por fecha.
- `backend/app/Validators/CuponeraValidator.ts` - Validación de payload de cuponera.
- `backend/app/Services/QrService.ts` - Generación y consumo de tokens de un solo uso; generación de PNG para QR del local.
- `backend/config/mail.ts` - Configuración de AWS SES.
 - `backend/config/mail.ts` - Configuración de proveedor de email (drivers: console/Ethereal/MailHog para dev; SES para prod).
- `backend/database/migrations/*` - Migraciones para todas las tablas mencionadas.
- `backend/tests/feature/*.spec.ts` - Tests de auth, cuponera, asignación, sellos, canje, reportes.
- `frontend/.env.example` - Variables del cliente (API base URL, OAuth client IDs, etc.).
- `frontend/src/lib/config.ts` - Carga de `BASE_URL` y endpoints API.
- `frontend/src/lib/api.ts` - Cliente HTTP centralizado.
- `frontend/src/styles/theme.ts` - Tema de Mantine (paleta y estilos base).
- `frontend/src/App.tsx` - Rutas y layout principal.
- `frontend/src/pages/Login.tsx` - Login (email/social) y verificación.
- `frontend/src/pages/Register.tsx` - Registro (email/social).
- `frontend/src/pages/Admin/Dashboard.tsx` - Panel admin con métricas rápidas.
- `frontend/src/pages/Admin/CuponeraForm.tsx` - Crear/editar cuponera.
- `frontend/src/pages/Admin/QrScanner.tsx` - Lector de QR y otorgar sellos (1–20).
- `frontend/src/pages/Admin/Reports.tsx` - Tabla con filtros por rango de fechas.
- `frontend/src/pages/Cliente/Cuponera.tsx` - Vista del cliente con progreso y premios.
- `frontend/src/pages/Cliente/GenerateStampQr.tsx` - Generación de QR de sellos.
- `frontend/src/pages/Cliente/GenerateRedeemQr.tsx` - Generación de QR de canje.
- `frontend/src/components/ProgressBar.tsx` - Componente de progreso.
- `frontend/src/components/PrizeCard.tsx` - Componente de premio con estado.
- `frontend/src/**/__tests__/*.test.tsx` - Tests de UI.

### Notes

- Unit tests deben ubicarse junto a los archivos de código correspondientes (por ejemplo, `MyComponent.tsx` y `MyComponent.test.tsx`).
- Usar `npx jest [optional/path/to/test/file]` para correr tests. Sin path ejecuta todos los tests según la configuración.

## Tasks

- [ ] 0.0 Inicialización de Proyectos
  - [x] 0.1 Backend: crear proyecto AdonisJS (TypeScript) en `backend/` con configuración base y copia de `.env.example`.
  - [x] 0.2 Frontend: crear proyecto Vite + React + TypeScript + Mantine en `frontend/` con configuración base y copia de `.env.example`.

- [ ] 1.0 Autenticación y Cuentas
  - [x] 1.1 Backend: configurar modelos `User` (roles `ADMIN`/`CLIENTE`), hashing, verificación de email y recuperación.
  - [x] 1.2 Backend: endpoints de registro/login/logout, verificación (link vía email), password reset.
  - [ ] 1.3 (Pospuesto) — Backend: OAuth Google/Facebook (endpoints y callback); almacenamiento de vínculo OAuth↔usuario.
  - [ ] 1.4 Backend: restricción 1 admin por local (modelo `Local` 1:1 con usuario admin, validación al crear).
  - [ ] 1.5 Frontend: páginas `Login` y `Register` (solo email/contraseña) con Mantine.
  - [ ] 1.6 Frontend: manejo de sesión y guardas de ruta por rol.
  - [ ] 1.7 Email: implementar proveedor con drivers por entorno — DEV: `console` (log) o `Ethereal` (preview URL) o `MailHog`; PROD: `SES`. Plantillas simples.
  - [ ] 1.8 Tests: unit/integration de auth (registro, login, verificación, reset, OAuth feliz y errores).
  - [ ] 1.9 Frontend: verificación de email (pantalla de confirmación por token).
  - [ ] 1.10 Frontend: "Olvidé mi contraseña" (request y reset por token).
  - [ ] 1.11 Backend: finalizar OAuth (Google/Facebook) y configuración Ally.
  - [ ] 1.12 Frontend: botones Google/Facebook; integración flujo OAuth.

- [ ] 2.0 Gestión de Cuponera del Local
  - [ ] 2.1 Backend: modelos `Local` y `Cuponera` (única por local) con validaciones (`totalSellos`, `premios[]`, `fechaCaducidad`).
  - [ ] 2.2 Backend: endpoints crear/actualizar cuponera; middleware de rol admin.
  - [ ] 2.3 Backend: reglas globales — cambios aplican a todos los cupones existentes; bloquear operaciones si expirada.
  - [ ] 2.4 Frontend (admin): formulario crear/editar con validaciones UI; feedback de éxito/error.
  - [ ] 2.5 Tests: validaciones de payload, reglas de expiración y unicidad por local.

- [ ] 3.0 QR del Local y Asignación de Cupón
  - [ ] 3.1 Backend: generar `localPublicId` aleatorio al crear local.
  - [ ] 3.2 Backend: endpoint para obtener PNG del QR del local (`BASE_URL/registro?local=...`).
  - [ ] 3.3 Backend: endpoint `/registro` que preserva `localPublicId`, fuerza login/registro y asigna cupón si no existe.
  - [ ] 3.4 Frontend: página de registro/login con `localPublicId` en flujo; redirección a cuponera del cliente tras asignación.
  - [ ] 3.5 Frontend (admin): sección para descargar QR del local (PNG) y breve instrucción de impresión.
  - [ ] 3.6 Tests: asignación automática de cupón; descarga de QR; seguridad básica (id opaco).

- [ ] 4.0 Experiencia del Cliente
  - [ ] 4.1 Frontend: página `Cliente/Cuponera` con progreso, lista de premios y estados.
  - [ ] 4.2 Frontend: generar QR de sellos (token un solo uso, TTL 5 min) y mostrarlo en pantalla.
  - [ ] 4.3 Frontend: generar QR de canje para premio elegible y mostrarlo.
  - [ ] 4.4 Frontend: refresco del estado tras operaciones (pull al reingresar a la vista o botón de actualizar).
  - [ ] 4.5 Tests: render de progreso, elegibilidad de premios, generación de QR.

- [ ] 5.0 Otorgamiento de Sellos (Admin)
  - [ ] 5.1 Backend: endpoint para emitir token STAMP (si aplica) y endpoint para consumirlo otorgando N sellos.
  - [ ] 5.2 Backend: validaciones — TTL activo, token no consumido, mismo `localId`, límite por cuponera, máx. 20 por operación.
  - [ ] 5.3 Frontend (admin): `QrScanner` para leer token; input controlado para cantidad (1–20); confirmación y feedback.
  - [ ] 5.4 Frontend (cliente): reflejar incremento cuando vuelve a la vista (pull/refresh o notificación simple).
  - [ ] 5.5 Tests: consumo único de token, validaciones y límites, UI de escaneo y edge cases.

- [ ] 6.0 Canje de Premios por Hitos
  - [ ] 6.1 Backend: lógica de elegibilidad por índice `k` (premios ordenados asc. por `cantidadSellos`).
  - [ ] 6.2 Backend: endpoint para generar token REDEEM (un solo uso, TTL 5 min) y endpoint de consumo (admin).
  - [ ] 6.3 Frontend (cliente): generar QR de canje para premio elegible.
  - [ ] 6.4 Frontend (admin): escanear QR de canje y confirmar; feedback.
  - [ ] 6.5 Tests: canje exitoso, orden de canjes, bloqueo cuando no elegible, no reversión.

- [ ] 7.0 Reportes y Auditoría
  - [ ] 7.1 Backend: modelo `Evento` y escritura en cada operación (asignación, sellos, canje).
  - [ ] 7.2 Backend: endpoints de reporte con filtros de fecha (rango) y agregaciones por cliente.
  - [ ] 7.3 Frontend (admin): tabla con filtros y totales; paginación simple si es necesario.
  - [ ] 7.4 Tests: cálculos por rango, totales y consistencia con eventos.

- [ ] 8.0 Configuración e Integraciones de Plataforma
  - [x] 8.1 Crear `.env.example` en backend y frontend con `BASE_URL`, `DB_*`, `MAIL_DRIVER` (`console`|`ethereal`|`mailhog`|`ses`), `SES_*`, `GOOGLE_*`, `FACEBOOK_*` y valores de desarrollo.
  - [x] 8.2 Configurar `BASE_URL` desde un único archivo (`config.ts` en frontend; `.env` en backend) y usarlo en generación de URLs.
  - [ ] 8.3 Migraciones y seeders iniciales (roles, usuario admin de prueba, local y cuponera dummy).
  - [ ] 8.4 Backend: integrar drivers de email — DEV: `console` o `Ethereal` (generar cuenta y mostrar preview URL en logs) o `MailHog` (localhost:1025); PROD: `SES`.
  - [ ] 8.5 Configurar OAuth (Google/Facebook) con credenciales de dev; callback URLs usando `BASE_URL`.
  - [ ] 8.6 CI local: scripts npm para lint, build y test; configuración Jest (o runner del framework) en frontend y backend.
  - [ ] 8.7 Preparación de despliegue AWS inicial (documentar o template infra mínima); variables de entorno por stage.
  - [ ] 8.8 Documentación README de setup local paso a paso.



