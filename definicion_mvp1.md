# 🏋️ OLYMPUS CORE — Definición Funcional del MVP1

> **Versión del entregable:** MVP1  
> **Sistema:** OLYMPUS CORE — Sistema Gestor de Gimnasio  
> **Propósito del documento:** Definir el alcance funcional completo del MVP1: qué hace el sistema, cómo lo hace, qué reglas aplica y qué actores participan.

---

## 1. Descripción general del sistema

OLYMPUS CORE es un sistema web de gestión integral para gimnasios. Su objetivo es digitalizar los procesos operativos del negocio: control de membresías, registro de pagos, verificación de acceso por código QR, gestión de clases grupales y el sistema de reservas y penalizaciones por inasistencia.

El MVP1 cubre los módulos esenciales que resuelven los **pain points** críticos del negocio:
- Socios con membresías vencidas que ingresan al gimnasio sin control.
- Reservas de clases gestionadas informalmente por WhatsApp.
- Falta de visibilidad financiera y operativa para el administrador.

---

## 2. Actores del sistema

| Actor | Descripción | Acceso |
|---|---|---|
| **Administrador** | Dueño o encargado principal del gimnasio | Acceso total a todos los módulos |
| **Recepcionista** | Personal de atención al público | Socios, Pagos, Acceso QR, Clases, Reservas, Membresías |
| **Entrenador** | Instructor de clases grupales | Solo lectura: Clases, Dashboard |
| **Socio** | Miembro registrado del gimnasio | Mi Perfil, Clases, Mis Reservas |

---

## 3. Módulos funcionales del MVP1

El MVP1 contempla **10 módulos funcionales** distribuidos entre el panel administrativo y la vista del socio.

---

### Módulo 1 — Autenticación (`/login`)

**Descripción:** Permite a todos los usuarios del sistema iniciar sesión de forma segura. El sistema autentica mediante email y contraseña, genera un token JWT y redirige al usuario a la vista correspondiente a su rol.

**Funciones:**
- Formulario de login con validación de campos en el frontend (email con formato válido, contraseña no vacía).
- Autenticación via JWT con expiración de 24 horas.
- Token persistido en `localStorage` para mantener la sesión entre recargas.
- Redirección automática al Dashboard tras login exitoso.
- Redirección a `/login` si se intenta acceder a una ruta protegida sin sesión activa.
- Cierre de sesión con limpieza del token.
- Control de acceso por rol: cada usuario ve únicamente los módulos a los que tiene acceso.

**Reglas de negocio aplicadas:**
- El sistema distingue 4 roles: `administrador`, `recepcionista`, `entrenador`, `socio`.
- Cada rol tiene rutas permitidas y prohibidas; intentar acceder a una ruta no permitida redirige al Dashboard.

---

### Módulo 2 — Dashboard (`/dashboard`)

**Descripción:** Panel de control para administradores, recepcionistas y entrenadores. Concentra las métricas clave del negocio en tiempo real para tomar decisiones rápidas al inicio del día.

**Funciones:**
- **Stat cards** con 4 métricas obligatorias (RN-08):
  - Ingresos del día (suma de pagos registrados hoy).
  - Socios activos (socios con membresía vigente).
  - Membresías por vencer en los próximos 3 días.
  - Clases grupales programadas para hoy.
- **Panel de alertas:** lista de socios cuya membresía vence en ≤3 días, con acceso directo a su ficha.
- **Panel de ocupación:** estado de las clases del día con barra de aforo visual.
- Botón de actualización manual sin recarga completa de la página.

**Reglas de negocio aplicadas:**
- RN-08: El dashboard debe mostrar al menos las 3 métricas definidas por el negocio.

---

### Módulo 3 — Socios (`/socios`)

**Descripción:** CRUD completo de socios del gimnasio. Accesible para administradores y recepcionistas. Los entrenadores pueden ver socios en modo lectura.

**Funciones:**
- **Listado paginado** de socios en formato de tarjetas (grid), con búsqueda en tiempo real por nombre o DNI y filtro por estado (activo / inactivo).
- **Registro de nuevo socio:** formulario con validaciones (DNI de 8 dígitos, email con formato válido, teléfono de 9 dígitos empezando en 9). Al registrar un socio, el sistema crea automáticamente una cuenta de usuario con contraseña por defecto `Demo1234`.
- **Edición de datos:** modificación de nombre, apellido, email, teléfono y fecha de nacimiento.
- **Desactivación lógica:** el socio no se elimina físicamente; su estado cambia a `inactivo`.
- **Generación de código QR:** cada socio tiene un código QR vinculado a su ID. El QR tiene una vigencia configurable y puede descargarse como imagen `.png` o copiarse el token.
- **Registro de pago desde la tarjeta:** acceso rápido al modal de pago sin salir de la página de socios.
- Visualización del estado de membresía directamente en la tarjeta del socio (plan activo y días restantes).

**Reglas de negocio aplicadas:**
- RF-01: Registro de socios con datos obligatorios (nombre, apellido, DNI, email).
- Unicidad de DNI y email en el sistema.

---

### Módulo 4 — Pagos (`/pagos`)

**Descripción:** Registro y consulta del historial de pagos de membresías. Al confirmar un pago, el sistema activa automáticamente una nueva membresía para el socio. Accesible para administradores y recepcionistas.

**Funciones:**
- **Historial de pagos** en tabla con columnas: socio, plan, monto, método de pago, fecha.
- **Stat card** con el total acumulado en el período visible.
- **Filtros:** por método de pago (efectivo, Yape, Plin, tarjeta) y por rango de fechas.
- **Nuevo pago:** búsqueda del socio por DNI, selección del plan (Mensual / Trimestral / Semestral / Anual), selección del método, confirmación con cálculo del monto. Al confirmar:
  - Se registra el pago en la tabla `pagos`.
  - Se crea una nueva membresía con fecha de inicio igual a hoy y fecha de fin según la duración del plan.
  - El estado de la membresía se activa automáticamente.
- **Cálculo dinámico:** al cambiar el plan seleccionado, el total a cobrar se actualiza en tiempo real.

**Reglas de negocio aplicadas:**
- RF-09, RF-14, RF-15: Un pago válido activa la membresía del socio.
- RN-05: Catálogo cerrado de precios; el sistema no permite ingresar montos arbitrarios.

---

### Módulo 5 — Membresías (`/membresias`)

**Descripción:** Vista de monitoreo del estado de membresías de todos los socios activos. Permite al administrador y recepcionista identificar rápidamente qué socios tienen membresía vigente, cuáles están por vencer y cuáles ya vencieron.

**Funciones:**
- **Tres pestañas de filtrado:**
  - ✅ **Activas:** socios con membresía vigente (`fecha_fin >= hoy` y estado `activa`).
  - ⚠️ **Por vencer (3d):** socios cuya membresía vence en los próximos 3 días.
  - ❌ **Vencidas:** socios con membresía expirada o en estado `vencida`.
- **Contador de socios** por pestaña (badge numérico).
- **Tabla de resultados** con columnas: socio, DNI, plan, fecha de inicio, fecha de vencimiento, días restantes, estado.
- **Columna de días restantes** con código de color:
  - 🟢 Verde: más de 3 días.
  - 🟡 Amarillo: 3 días o menos.
  - 🔴 Rojo: membresía vencida.

**Reglas de negocio aplicadas:**
- RN-01: La membresía vencida implica que el socio no puede acceder al gimnasio ni reservar clases.

---

### Módulo 6 — Acceso QR (`/acceso`)

**Descripción:** Terminal de verificación de acceso al gimnasio mediante código QR. Accesible para administradores y recepcionistas. Permite registrar el intento de ingreso de un socio y devuelve un resultado visual inmediato (PERMITIDO / DENEGADO).

**Funciones:**
- **Modo escáner:** interfaz de cámara con animación de línea para escanear el QR del socio.
- **Modo manual:** campo de texto para ingresar el token QR copiado desde el perfil del socio o desde la ficha en socios.
- Verificación del token: el sistema valida firma, expiración y estado de membresía del socio.
- **Resultado visual:**
  - ✅ **PERMITIDO** (fondo verde): membresía activa y token válido. Muestra nombre del socio y fecha de verificación.
  - ❌ **DENEGADO** (fondo rojo): con motivo explícito ("Membresía vencida" / "QR inválido o expirado").
- **Log de accesos recientes:** panel con los últimos intentos (permitidos y denegados) con hora de registro.

**Reglas de negocio aplicadas:**
- RF-03, RF-04, RF-05: Todo acceso físico al gimnasio debe verificarse con el QR del socio.
- RN-01: Si la membresía está vencida, el acceso es DENEGADO.

---

### Módulo 7 — Clases Grupales (`/clases`)

**Descripción:** Catálogo de clases grupales disponibles en el gimnasio. Permite al administrador crear y gestionar las clases, y a los socios visualizarlas y reservar su lugar.

**Funciones:**
- **Listado en grid de tarjetas** con: nombre de la clase, tipo (Spinning, Yoga, CrossFit, etc.), instructor, fecha y hora, duración, aforo disponible y barra de capacidad visual.
- **Filtros:** por tipo de clase, por fecha y por disponibilidad (solo clases con cupos libres).
- **Barra de aforo** con código de color:
  - 🟢 Verde: menos del 75% de ocupación.
  - 🟡 Amarillo: entre 75% y 99%.
  - 🔴 Rojo: lleno (sin cupos disponibles).
- **Creación de clase** (solo admin): formulario con nombre, tipo, instructor, fecha/hora, duración y aforo máximo. Validación de campos obligatorios.
- **Edición de clase** (solo admin): modificación de cualquier campo de una clase existente.
- **Eliminación de clase** (solo admin): confirmación antes de eliminar.
- **Botón "Reservar"** visible únicamente para socios con membresía activa, en clases futuras con cupos disponibles.
- Las clases con fecha pasada no permiten nuevas reservas.

**Reglas de negocio aplicadas:**
- RF-06: El sistema gestiona clases grupales con aforo máximo.
- RN-02: El aforo máximo por clase no puede superarse.

---

### Módulo 8 — Reservas Admin (`/reservas`)

**Descripción:** Vista de administración de todas las reservas del sistema. Permite al administrador y recepcionista registrar asistencias e inasistencias, y filtrar reservas por múltiples criterios.

**Funciones:**
- **Stat cards** en la parte superior: total de reservas, confirmadas, asistencias registradas e inasistencias.
- **Tabla completa** de reservas con columnas: socio, DNI, clase, fecha/hora, estado, acciones.
- **Filtros:** por estado (confirmada / asistió / inasistencia / cancelada), por fecha y por nombre de socio (búsqueda en tiempo real).
- **Registro de asistencia** (✔): disponible para reservas de clases ya realizadas con estado `confirmada`. Cambia el estado a `asistio`.
- **Registro de inasistencia** (✕): disponible bajo las mismas condiciones. Cambia el estado a `inasistencia` y activa el sistema de penalizaciones.
- Clases futuras: no muestran botones de asistencia/inasistencia.

**Reglas de negocio aplicadas:**
- RF-07: El administrador puede registrar la asistencia de cada socio a sus clases reservadas.
- RN-04: Una inasistencia injustificada puede generar un strike.

---

### Módulo 9 — Mis Reservas (`/mis-reservas`) — Vista Socio

**Descripción:** Vista personal del socio para consultar y gestionar sus propias reservas. Solo accesible para el rol `socio`.

**Funciones:**
- **Stat cards:** número de clases próximas, total de asistencias e inasistencias.
- **Pestaña "Próximas":** reservas con estado `confirmada` cuya clase aún no ha ocurrido. Permite cancelar la reserva.
- **Pestaña "Historial":** reservas pasadas o canceladas, con badge de estado visual (Asistió 🏆, Inasistencia ⚠️, Cancelada ❌).
- **Cancelación de reserva:** modal de confirmación. Solo disponible en reservas futuras.
- Los botones de cancelación no aparecen en el historial.

**Reglas de negocio aplicadas:**
- RF-08: El socio puede cancelar una reserva.
- RN-03: Solo se puede cancelar hasta 2 horas antes del inicio de la clase.

---

### Módulo 10 — Mi Perfil (`/mi-perfil`) — Vista Socio

**Descripción:** Panel personal del socio que concentra su información operativa: código QR de acceso, estado de membresía, strikes acumulados y próximas clases reservadas. Solo accesible para el rol `socio`.

**Funciones:**
- **Código QR de acceso:** imagen del QR vinculado al socio con fecha de expiración del token. Botones para copiar el token al portapapeles y descargar el QR como `.png`.
- **Panel de membresía:**
  - Si tiene membresía activa: muestra plan, estado, fecha de vencimiento y días restantes (con código de color verde/amarillo/rojo).
  - Si no tiene membresía: mensaje de aviso indicando que debe acercarse a recepción.
- **Panel de strikes:**
  - Sin strikes: badge verde "Sin strikes".
  - 1–2 strikes: badge amarillo con conteo (ej. "2/3 STRIKES").
  - 3 strikes (bloqueado): badge rojo "Bloqueado" con la fecha y hora exacta de desbloqueo.
  - Historial de las últimas inasistencias con nombre de clase y fecha.
- **Panel de próximas clases:** lista de reservas confirmadas con fecha futura (nombre de la clase, fecha y hora).
- Si no hay reservas próximas: mensaje con link directo a `/clases`.

**Reglas de negocio aplicadas:**
- RN-01: Si la membresía está vencida, el QR generado será rechazado en el control de acceso.
- RN-04: 3 inasistencias injustificadas en 30 días generan un bloqueo de 7 días para reservar clases.

---

## 4. Planes de membresía disponibles

El sistema maneja un catálogo cerrado de planes (RN-05). No se pueden registrar precios fuera de este catálogo.

| Plan | Duración | Precio |
|---|---|---|
| Plan Mensual | 30 días | S/ 100.00 |
| Plan Trimestral | 90 días | S/ 260.00 |
| Plan Semestral | 180 días | S/ 480.00 |
| Plan Anual | 365 días | S/ 850.00 |

---

## 5. Reglas de negocio del MVP1

| ID | Regla | Módulos que la aplican |
|---|---|---|
| RN-01 | Membresía vencida = acceso bloqueado y sin reservas | Acceso QR, Clases, Mi Perfil |
| RN-02 | El aforo máximo por clase no puede superarse | Clases, Reservas |
| RN-03 | Cancelación de reserva solo hasta 2h antes del inicio | Mis Reservas |
| RN-04 | 3 inasistencias injustificadas en 30 días = bloqueo de 7 días para reservar | Reservas Admin, Mi Perfil |
| RN-05 | Catálogo cerrado de precios; no se aceptan montos arbitrarios | Pagos |
| RN-07 | Un socio no puede tener dos reservas activas para la misma clase | Clases, Reservas |
| RN-08 | El dashboard debe mostrar las métricas operativas clave | Dashboard |

---

## 6. Permisos por módulo y rol

| Módulo | Admin | Recepcionista | Entrenador | Socio |
|---|---|---|---|---|
| Dashboard | ✅ Completo | ✅ Completo | ✅ Lectura | ❌ |
| Socios | ✅ CRUD | ✅ CRUD | ✅ Solo lectura | ❌ |
| Pagos | ✅ Ver + Registrar | ✅ Ver + Registrar | ❌ | ❌ |
| Membresías | ✅ Ver | ✅ Ver | ❌ | ❌ |
| Acceso QR | ✅ | ✅ | ❌ | ❌ |
| Clases | ✅ CRUD | ✅ Ver + Reservar | ✅ Solo lectura | ✅ Ver + Reservar |
| Reservas Admin | ✅ Ver + Gestionar | ✅ Ver + Gestionar | ❌ | ❌ |
| Mis Reservas | ❌ | ❌ | ❌ | ✅ Ver + Cancelar |
| Mi Perfil | ❌ | ❌ | ❌ | ✅ Completo |

---

## 7. Flujos funcionales principales

Estos son los flujos de extremo a extremo que el MVP1 es capaz de ejecutar de forma completa:

### Flujo 1 — Ciclo completo de membresía
1. Administrador registra un nuevo socio → sistema crea usuario y genera QR.
2. Recepcionista registra el pago del socio (plan seleccionado + método de pago).
3. El sistema activa la membresía automáticamente con las fechas calculadas.
4. El socio aparece en el tab "Activas" de Membresías.
5. El socio puede escanear su QR en recepción: resultado **PERMITIDO**.
6. El QR del mismo socio es **DENEGADO** una vez expirada la membresía.

### Flujo 2 — Ciclo completo de reserva de clase
1. Administrador crea una clase grupal (nombre, tipo, instructor, fecha/hora, aforo).
2. El socio ve la clase disponible en `/clases`, verifica los cupos en la barra de aforo.
3. El socio confirma la reserva → el aforo disponible disminuye en 1.
4. Si el socio cancela antes de 2 horas → el cupo se libera.
5. Tras la clase, el administrador registra asistencia o inasistencia desde `/reservas`.
6. Con 3 inasistencias en 30 días el socio queda bloqueado para reservar nuevas clases por 7 días.

### Flujo 3 — Sistema de penalizaciones
1. El administrador registra la inasistencia de un socio que no asistió a su reserva.
2. El socio acumula un strike visible en su panel de Mi Perfil.
3. Al alcanzar 3 strikes en 30 días, el sistema crea un bloqueo de 7 días.
4. El socio ve el badge rojo "Bloqueado" con la fecha de desbloqueo en su perfil.
5. Intentar reservar durante el bloqueo devuelve el error "Penalización activa".

### Flujo 4 — Verificación de acceso QR
1. El socio muestra o comparte su código QR.
2. El recepcionista accede a `/acceso` y escanea el QR o pega el token manualmente.
3. Si la membresía está activa: resultado **PERMITIDO** con nombre del socio.
4. Si la membresía está vencida o el token expiró: resultado **DENEGADO** con motivo.
5. El intento queda registrado en el log de accesos recientes.

---

## 8. Funciones excluidas del MVP1

Las siguientes funcionalidades están fuera del alcance del MVP1 por complejidad o dependencias, pero serán implementadas en versiones posteriores:

| Función | Razón de exclusión | Versión destino |
|---|---|---|
| Rutinas de entrenamiento | Alta complejidad, baja urgencia para la demo | v1.1 |
| Progreso físico del socio | Requiere el módulo de rutinas como prerequisito | v1.1 |
| Ficha médica digital | Depende de rutinas para tener sentido operativo | v1.1 |
| Notificaciones automáticas (email/SMS) | Diferido en los requisitos del curso (SC-04) | v2.0 |
| Módulo completo del entrenador | Sin rutinas ni progreso, el rol quedaría vacío | v1.1 |
| Logs de acceso con pantalla dedicada | El endpoint existe, pero sin UI dedicada | v1.1 |

---

## 9. Endpoints de la API (resumen)

La comunicación entre frontend y backend sigue el contrato definido en `API_CONTRACT.md`. El backend expone una API REST bajo el prefijo `/api/v1`.

| Dominio | Métodos principales |
|---|---|
| Auth | `POST /auth/login`, `GET /auth/me`, `POST /auth/logout` |
| Socios | `GET /socios`, `POST /socios`, `PUT /socios/:id`, `DELETE /socios/:id`, `GET /socios/:id/qr` |
| Planes | `GET /planes` |
| Pagos | `GET /pagos`, `POST /pagos`, `GET /pagos/planes` |
| Membresías | `GET /membresias`, `GET /membresias/:id` |
| Acceso QR | `POST /acceso/verificar`, `GET /acceso/logs` |
| Clases | `GET /clases`, `POST /clases`, `PUT /clases/:id`, `DELETE /clases/:id` |
| Reservas | `GET /reservas`, `POST /reservas`, `DELETE /reservas/:id`, `PATCH /reservas/:id/estado` |
| Penalizaciones | `GET /socios/:id/strikes`, `DELETE /socios/:id/strikes/:strikeId` |
| Dashboard | `GET /dashboard` |

---

## 10. Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| **Frontend** | React + Vite, Vanilla CSS, React Router |
| **Backend** | Node.js, Express.js |
| **Base de datos** | PostgreSQL (Neon — cloud) |
| **Autenticación** | JWT (jsonwebtoken) + bcrypt |
| **QR** | qrcode (generación server-side) |
| **Testing BE** | Supertest + Jest |
| **Control de versiones** | Git + GitHub |
