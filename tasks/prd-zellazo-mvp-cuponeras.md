# PRD: Zellazo – MVP de Cuponeras Digitales

## 1. Introducción / Resumen

Zellazo es una plataforma digital de fidelización que reemplaza los cupones/sellos físicos por una cuponera digital. Cada local (comercio) crea una única cuponera con premios definidos por hitos de sellos. Los clientes escanean un QR del local para registrarse o loguearse y recibir automáticamente su cupón (una cuponera asignada por local). Luego, el cliente genera un QR personal que el admin del local escanea para otorgar sellos. Al alcanzar los sellos necesarios para un premio, el cliente inicia el canje mostrando un QR de canje que el admin valida escaneando.

Objetivo del MVP: permitir a un local crear/gestionar una única cuponera, que los clientes obtengan su cupón mediante QR, que el local otorgue sellos escaneando el QR del cliente, y que se puedan canjear premios por hitos, con un panel básico de reportes por fecha para el admin.

Suposiciones de despliegue y marca: dominio tentativo `zellazo.com` (base URL configurable desde un único lugar); stack: Frontend React + Mantine, Backend Node.js (AdonisJS), despliegue en AWS. Idioma: español. Conexión online requerida.

## 2. Metas

- Permitir a cada local crear y mantener una única cuponera activa con premios por hitos.
- Asignar automáticamente un cupón (una por local) al cliente al escanear el QR del local y registrarse/iniciar sesión.
- Permitir que el admin otorgue sellos escaneando el QR dinámico del cliente, sin exceder el total de sellos de la cuponera.
- Permitir el canje de premios por hitos mediante un QR de canje validado por el admin (sin reversión en MVP).
- Proveer un panel para el admin con métricas básicas y filtro por rango de fechas (sin exportación CSV en MVP).
- Autenticación con email/password (con verificación de email y recuperación) y login social (Google y Facebook) en MVP.

## 3. Historias de Usuario

### Admin (dueño del local)
- Como admin, quiero registrarme/verificar mi email e iniciar sesión para acceder a mi panel.
- Como admin, quiero crear una única cuponera con nombre, total de sellos, premios por hitos y fecha de caducidad.
- Como admin, quiero editar mi cuponera y que los cambios apliquen a todos los cupones ya emitidos de mi local.
- Como admin, quiero escanear el QR del cliente y otorgar la cantidad de sellos que elija, sin superar el máximo de la cuponera.
- Como admin, quiero validar y completar un canje escaneando el QR de canje del cliente.
- Como admin, quiero ver un reporte con clientes, sellos otorgados, premios canjeados y fechas, filtrable por rango temporal.

### Cliente (usuario final)
- Como cliente, quiero escanear el QR del local para registrarme/iniciar sesión y obtener automáticamente mi cupón de ese local si no lo tengo.
- Como cliente, quiero ver mi progreso de sellos y los premios disponibles/canjeados.
- Como cliente, quiero generar un QR personal de sellos para que el admin lo escanee y me otorgue sellos.
- Como cliente, quiero canjear un premio cuando alcance el hito de sellos correspondiente, mostrando un QR de canje que el admin valida.

## 4. Requerimientos Funcionales

FR-1 Autenticación y cuentas
1. Debe existir registro/login por email/password con verificación de email obligatoria y recuperación de contraseña.
2. Debe permitirse login social con Google y Facebook en el MVP.
3. Un local tendrá exactamente una cuenta admin (una cuenta por local en MVP). No hay múltiples admins por local.

FR-2 Modelo de cuponera del local
1. Cada local puede tener solo una cuponera activa.
2. Campos mínimos de cuponera:
   - `nombre` (string)
   - `totalSellos` (entero positivo)
   - `premios` (lista): cada premio `{ nombre: string, cantidadSellos: entero positivo }`
   - `fechaCaducidad` (fecha)
3. Cambios en la cuponera aplican globalmente a todos los cupones emitidos por ese local (efecto retroactivo).
4. Al alcanzar `fechaCaducidad`, se debe impedir otorgar nuevos sellos y realizar canjes; la cuponera y sus cupones quedan expirados/solo lectura.

FR-3 Cupón del cliente (por local)
1. Un cliente puede tener a lo sumo un cupón por cada local.
2. Al escanear el QR del local y completar login/registro, si el cliente no tiene cupón de ese local, se crea/activa automáticamente.
3. Un cupón mantiene:
   - `clienteId`, `localId`
   - `sellosAcumulados` (entero, no puede superar `totalSellos`)
   - `premiosCanjeados` (lista ordenada de premios canjeados con timestamps)
   - `historialEventos` (ver FR-10)

FR-4 QR del local (asignación de cupón)
1. El QR del local es estático y público. MVP simple y razonablemente seguro: URL con identificador no adivinable del local:
   - Formato: `https://zellazo.com/registro?local={localPublicId}`
   - `localPublicId` es un identificador aleatorio (p. ej., UUID v4 o Base58 de alta entropía) que mapea en backend al `localId`.
   - Usa `baseUrl` configurable; el ejemplo asume `zellazo.com`.
2. Al abrir la URL:
   - Si el usuario no está autenticado, mostrar pantalla de registro/login y preservar `localPublicId` en el flujo.
   - Si ya está autenticado, asignar/activar cupón del local si no existe y redirigir a la vista de su cuponera.
3. El sistema debe permitir descargar la imagen del QR del local (PNG) para impresión.

FR-5 Progreso y visualización del cliente
1. La UI del cliente debe mostrar barra/porcentaje de progreso respecto de `totalSellos` y la lista de premios con su estado (disponible, canjeado, pendiente).
2. Tras otorgar sellos, el cliente debe ver el incremento reflejado en tiempo real o inmediatamente tras la operación.

FR-6 Generación de QR del cliente para sellos (dinámico, un solo uso)
1. Desde su sesión, el cliente puede generar un QR dinámico de sellos.
2. El QR codifica una URL con un token de un solo uso y corta duración:
   - Formato: `https://zellazo.com/stamp?t={token}`
   - `token` es opaco, generado por el servidor, asociado a `{userId, localId}` y con TTL de 5 minutos. Se marca como consumido al primer uso.
3. El token solo puede ser canjeado por un admin del mismo `localId` que el cupón del cliente.

FR-7 Otorgamiento de sellos por el admin
1. Desde su panel, el admin puede abrir el lector de QR e ingresar la cantidad de sellos a otorgar (entre 1 y 20).
2. Validaciones al otorgar:
   - El token es válido, no consumido, dentro de TTL, y corresponde al `localId` del admin.
   - El cupón del cliente pertenece a la cuponera del admin.
   - La suma no puede superar `totalSellos` de la cuponera.
   - La cuponera no debe estar expirada.
   - La cantidad por operación no puede superar 20 sellos.
3. Al confirmar, el sistema incrementa `sellosAcumulados`, registra evento (FR-10) y retorna confirmación.
4. La UI del admin muestra resultado y la del cliente refleja los nuevos sellos.

FR-8 Canje de premios (por hitos, sin reversión en MVP)
1. Modelo de hitos: los sellos canjeados no "descuentan" saldo global; se consideran hitos alcanzados.
2. Elegibilidad de canje:
   - Sea `premios` ordenados por `cantidadSellos` (asc). Si el cliente tiene `k` premios ya canjeados, el próximo premio elegible es `premios[k]` si `sellosAcumulados >= premios[k].cantidadSellos`.
3. Flujo:
   - El cliente elige canjear un premio disponible y genera un QR de canje de un solo uso: `https://zellazo.com/redeem?t={token}` asociado a `{userId, localId, premioIndex}` con TTL de 5 minutos.
   - El admin escanea y confirma. El backend valida elegibilidad, marca el premio como canjeado (append en `premiosCanjeados` con timestamp) y consume el token.
   - No hay reversión en el MVP.

FR-9 Reportes del admin (tabla y filtros)
1. Vista con listado de clientes con cupón activo del local, incluyendo:
   - Sellos otorgados (totales) por cliente.
   - Premios canjeados por cliente con fechas.
2. Filtro por rango de fechas que afecte los cálculos mostrados (considerando eventos dentro del rango).
3. No se requiere exportación CSV en el MVP.

FR-10 Registro de historial (auditoría mínima)
1. Para cada otorgamiento de sellos: `{cupónId, adminId, cantidad, timestamp, origen: 'qr', tokenId}`.
2. Para cada canje: `{cupónId, adminId, premioIndex, premioNombre, timestamp, tokenId}`.
3. Para asignación de cupón tras QR del local: `{clienteId, localId, timestamp}`.

FR-11 Estados y límites
1. No se pueden otorgar sellos si `sellosAcumulados` ya alcanzó `totalSellos`.
2. No se pueden otorgar sellos ni canjear premios si la cuponera está expirada.
3. Un admin no puede operar sobre cupones de otros locales.
4. Límite por operación: máximo 20 sellos otorgados por transacción.

FR-12 UI/UX
1. Web responsive (mobile-first) con Mantine. Estilo limpio y moderno. Paleta base sugerida: primario #1F7A8C, acento #BFDBF7, fondo #F5F7FA.
2. Pantallas mínimas:
   - Registro/Login (con social login y verificación de email)
   - Vista cuponera del cliente (progreso, premios, generar QR sellos, generar QR de canje)
   - Panel admin (crear/editar cuponera, lector de QR, otorgar sellos, reportes con filtro)
   - Descarga de QR del local (PNG)

## 5. No-Objetivos (Fuera de alcance en MVP)

- Exportación CSV, integraciones POS/inventario, pagos, notificaciones push/email transaccionales avanzadas.
- Apps nativas; solo web responsive.
- Modo offline; requiere conexión online.
- Múltiples cuentas admin por local.
- Revertir canjes o otorgamientos.
- Cumplimientos legales avanzados (GDPR, eliminación de cuenta/datos); solo mínimos de autenticación.
- Multi-idioma o manejo de zonas horarias.

## 6. Consideraciones de Diseño (Opcional)

- Mantine como base de componentes. Layout con header simple (logo Zellazo), navegación según rol.
- Componentes clave:
  - Progreso: barra con porcentaje y contadores de sellos.
  - Tarjetas de premios con estado (Disponible, Canjeado, Bloqueado) y CTA.
  - Modal/Lector QR en admin para flujos de otorgamiento/canje.
- Accesibilidad básica: contraste suficiente, estados de foco, tamaños táctiles adecuados.

## 7. Consideraciones Técnicas (Opcional)

- Backend: AdonisJS (Node.js) con Postgres (o equivalente) en AWS. Entidades sugeridas:
  - `User` (cliente/admin con rol)
  - `Local` (1:1 con `User` admin en MVP)
  - `Cuponera` (1:1 con `Local`)
  - `Cupon` (N por cliente, 1 por `Local`)
  - `QrToken` (tipo: `STAMP` | `REDEEM`, fields: token, userId, localId, ttl, usado, metadata)
  - `Evento` (auditoría de sellos/canjes/asignaciones)
- Autenticación: email/password con verificación; OAuth Google/Facebook.
- Email transaccional: AWS SES para verificación y recuperación (configurable por entorno).
- Configuración de URL pública: `BASE_URL` pública configurable (p. ej., `https://zellazo.com`) usada para generar URLs de QR.
- QR del local: identificador público aleatorio `localPublicId` (no secuencial) para URL. Sin firma criptográfica en MVP.
- QR del cliente (sellos y canje): token de un solo uso, TTL de 5 minutos, validado/consumido en servidor. Sin firma; seguridad por opacidad + control de servidor.
- Límites: sin rate-limiting sofisticado en MVP; validar pertenencia de cupón al local, topes por `totalSellos` y límite de 20 sellos por operación.
- Tiempo/zonas horarias: usar UTC internamente; mostrar en español sin necesidad de conversión por zona.

## 8. Métricas de Éxito

- Técnicas: tasa de éxito en creación de cuponera (>95%), éxito de escaneo/otorgamiento y canje (>95%), tiempos < 2s en operaciones críticas.
- Producto: al menos 20 locales activos, ~2,000 cupones asignados, >80% de admins completan su primera entrega de sellos.
- UX: NPS interno de admins ≥ 7 en pruebas piloto; ausencia de incidencias críticas de fraude.

## 9. Preguntas Abiertas

1. Dominio definitivo de producción a confirmar (por defecto configurable como `https://zellazo.com`).


