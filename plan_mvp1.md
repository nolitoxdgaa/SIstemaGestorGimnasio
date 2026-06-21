# 🏋️ OLYMPUS CORE — Plan de Desarrollo MVP1

> **Versión acotada y entregable** para la presentación del curso.  
> Criterio de corte: implementar lo que demuestra el mayor valor del sistema con el menor esfuerzo posible.

---

## Comparativa: Plan completo vs MVP1

| | Plan completo | **MVP1** |
|---|---|---|
| Módulos | 9 | **6** |
| Archivos backend | ~65 | **~38** |
| Archivos frontend | ~120 | **~72** |
| Integrantes necesarios | 4 | 4 |
| Tiempo estimado | 4–5 semanas | **2–3 semanas** |

---

## ¿Qué ENTRA en el MVP1?

Basado en la priorización MoSCoW de los documentos del curso, el MVP1 cubre los **Must Have** completos más los **Should Have** más impactantes:

| # | Módulo | Justificación | RF cubiertos |
|---|---|---|---|
| 1 | 🔐 **Autenticación** | Base de todo. Sin esto nada funciona | RF-02 |
| 2 | 👥 **Socios + Membresías + Pagos** | El core del negocio: registrar, cobrar, activar | RF-01, RF-09, RF-14, RF-15 |
| 3 | 📱 **Acceso QR** | El pain point principal del dueño (socios vencidos entrando) | RF-03, RF-04, RF-05 |
| 4 | 📅 **Clases + Reservas + Penalizaciones** | Elimina las reservas por WhatsApp, el segundo pain point | RF-06, RF-07, RF-08 |
| 5 | 📊 **Dashboard Admin** | Las 3 métricas que el dueño necesita cada mañana | RF-13, RN-08 |
| 6 | 🗂️ **Planes** | Catálogo cerrado de precios (RN-05) | RN-05 |

## ¿Qué QUEDA FUERA del MVP1?

| Módulo excluido | Por qué se excluye | ¿Dónde va? |
|---|---|---|
| Rutinas de entrenamiento | Alta complejidad, baja urgencia para la demo | v1.1 |
| Progreso físico | Requiere rutinas previas | v1.1 |
| Ficha médica digital | Depende de las rutinas para tener sentido completo | v1.1 |
| Notificaciones automáticas | Ya diferido en los documentos del curso (SC-04) | v2.0 |
| Módulo entrenador completo | Sin rutinas/progreso, el rol entrenador queda vacío | v1.1 |
| Logs de acceso detallados | El endpoint existe pero sin pantalla dedicada | v1.1 |

> ⚠️ **Nota académica:** Los módulos excluidos **igual se documentan** en la entrega del curso (están en los requisitos). Solo se posterga su implementación en código.

---

## Reglas de negocio cubiertas por el MVP1

| ID | Regla | ✅ En MVP1 |
|---|---|---|
| RN-01 | Membresía vencida = acceso bloqueado | ✅ |
| RN-02 | Aforo máximo por clase | ✅ |
| RN-03 | Cancelación solo hasta 2h antes | ✅ |
| RN-04 | 3 strikes en 30 días = bloqueo 7 días | ✅ |
| RN-05 | Catálogo cerrado de precios | ✅ |
| RN-06 | Ficha médica obligatoria para rutinas | ⏭️ v1.1 |
| RN-07 | Un socio no puede reservar dos clases en el mismo horario | ✅ |
| RN-08 | Dashboard con 3 métricas obligatorias | ✅ |

---

## Archivos del MVP1 — Backend

### ✅ Mantener e implementar

```
backend/
├── server.js
├── package.json
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── config/
    │   ├── database.js
    │   └── config.js
    ├── models/
    │   ├── index.js
    │   ├── Usuario.js          ← auth
    │   ├── Socio.js            ← socios
    │   ├── Plan.js             ← planes
    │   ├── Membresia.js        ← membresías
    │   ├── Pago.js             ← pagos
    │   ├── LogAcceso.js        ← acceso QR
    │   ├── ClaseGrupal.js      ← clases
    │   ├── Reserva.js          ← reservas
    │   └── Penalizacion.js     ← strikes
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── socio.controller.js
    │   ├── plan.controller.js
    │   ├── membresia.controller.js
    │   ├── pago.controller.js
    │   ├── acceso.controller.js
    │   ├── clase.controller.js
    │   ├── reserva.controller.js
    │   ├── penalizacion.controller.js
    │   └── dashboard.controller.js
    ├── routes/
    │   ├── index.js
    │   ├── auth.routes.js
    │   ├── socios.routes.js
    │   ├── planes.routes.js
    │   ├── membresias.routes.js
    │   ├── pagos.routes.js
    │   ├── acceso.routes.js
    │   ├── clases.routes.js
    │   ├── reservas.routes.js
    │   ├── penalizaciones.routes.js
    │   └── dashboard.routes.js
    ├── middlewares/
    │   ├── auth.middleware.js
    │   ├── roles.middleware.js
    │   ├── validate.middleware.js
    │   ├── logger.middleware.js
    │   └── errorHandler.middleware.js
    ├── services/
    │   ├── qr.service.js
    │   ├── membresia.service.js
    │   ├── acceso.service.js
    │   ├── penalizacion.service.js
    │   └── dashboard.service.js
    └── utils/
        ├── jwt.utils.js
        ├── bcrypt.utils.js
        ├── response.utils.js
        ├── validators.utils.js
        └── fecha.utils.js
```

**Tests MVP1 (mínimo indispensable):**
```
backend/tests/
├── auth.test.js
├── reserva.test.js        ← concurrencia crítica
└── acceso.test.js
```

### 🗄️ Archivos descartados para MVP1

```
backend/src/models/Rutina.js           → v1.1
backend/src/models/Ejercicio.js        → v1.1
backend/src/models/ProgresoFisico.js   → v1.1
backend/src/models/FichaMedica.js      → v1.1
backend/src/controllers/rutina.controller.js    → v1.1
backend/src/controllers/progreso.controller.js  → v1.1
backend/src/controllers/fichaMedica.controller.js → v1.1
backend/src/routes/rutinas.routes.js   → v1.1
backend/src/routes/progreso.routes.js  → v1.1
backend/src/routes/fichasMedicas.routes.js → v1.1
backend/src/services/notificacion.service.js → v2.0
backend/tests/penalizacion.test.js     → v1.1
backend/tests/concurrencia.test.js     → v1.1
backend/tests/socio.test.js            → v1.1
```

---

## Archivos del MVP1 — Frontend

### ✅ Mantener e implementar

```
frontend/src/
├── main.jsx
├── App.jsx
├── index.css
├── assets/logo.svg
├── context/
│   ├── AuthContext.jsx
│   └── NotificacionContext.jsx      ← alertas básicas UI
├── hooks/
│   ├── useAuth.js
│   ├── useSocios.js
│   ├── useClases.js
│   ├── useReservas.js
│   ├── usePagos.js
│   └── useDashboard.js
├── services/
│   ├── api.js
│   ├── auth.service.js
│   ├── socios.service.js
│   ├── membresias.service.js
│   ├── clases.service.js
│   ├── reservas.service.js
│   ├── pagos.service.js
│   ├── acceso.service.js
│   └── dashboard.service.js
├── utils/
│   ├── formatDate.js
│   ├── formatCurrency.js
│   ├── validators.js
│   └── roles.js
├── components/
│   ├── common/             ← TODOS (son compartidos)
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Footer.jsx
│   │   ├── Modal.jsx
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Table.jsx
│   │   ├── Alert.jsx
│   │   ├── Spinner.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   ├── EmptyState.jsx
│   │   ├── ConfirmModal.jsx
│   │   ├── SearchBar.jsx
│   │   ├── Pagination.jsx
│   │   └── StatCard.jsx
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── socios/
│   │   ├── SocioForm.jsx
│   │   ├── SocioTable.jsx
│   │   ├── SocioCard.jsx
│   │   ├── SocioQR.jsx
│   │   └── SocioFiltros.jsx
│   ├── membresias/
│   │   ├── MembresiaForm.jsx
│   │   ├── MembresiaCard.jsx
│   │   ├── MembresiaStatus.jsx
│   │   └── PlanSelector.jsx
│   ├── pagos/
│   │   ├── PagoForm.jsx
│   │   ├── PagoTable.jsx
│   │   └── HistorialPagos.jsx
│   ├── clases/
│   │   ├── ClaseCard.jsx
│   │   ├── ClaseList.jsx
│   │   ├── ClaseForm.jsx
│   │   ├── AforoIndicator.jsx
│   │   └── HorarioGrid.jsx
│   ├── reservas/
│   │   ├── ReservaCard.jsx
│   │   ├── ReservaList.jsx
│   │   ├── ReservaModal.jsx
│   │   ├── StrikesBadge.jsx
│   │   └── CancelacionModal.jsx
│   ├── acceso/
│   │   ├── QRScanner.jsx
│   │   ├── AccesoResult.jsx
│   │   └── QRDisplay.jsx
│   └── dashboard/
│       ├── MetricCard.jsx
│       ├── IngresosDiarios.jsx
│       ├── AlertasVencimiento.jsx
│       ├── OcupacionClases.jsx
│       └── DashboardChart.jsx
└── pages/
    ├── LoginPage.jsx
    ├── DashboardPage.jsx
    ├── SociosPage.jsx
    ├── SocioDetallePage.jsx
    ├── ClasesPage.jsx
    ├── ReservasPage.jsx          ← admin ve todas
    ├── MisReservasPage.jsx       ← socio ve las suyas
    ├── PagosPage.jsx
    ├── AccesoQRPage.jsx
    ├── PlanesPage.jsx
    ├── MiPerfilPage.jsx          ← el socio ve su QR + membresía
    └── NotFoundPage.jsx
```

### 🗄️ Archivos descartados para MVP1

```
frontend/src/context/ThemeContext.jsx        → opcional al final
frontend/src/hooks/useRutinas.js             → v1.1
frontend/src/hooks/useProgreso.js            → v1.1
frontend/src/services/rutinas.service.js     → v1.1
frontend/src/services/progreso.service.js    → v1.1
frontend/src/components/rutinas/             → v1.1 (4 archivos)
frontend/src/components/progreso/            → v1.1 (3 archivos)
frontend/src/components/fichaMedica/         → v1.1 (2 archivos)
frontend/src/components/pagos/PagoRecibo.jsx → v1.1
frontend/src/components/acceso/LogAccesoTable.jsx → v1.1
frontend/src/pages/RutinasPage.jsx           → v1.1
frontend/src/pages/MiRutinaPage.jsx          → v1.1
frontend/src/pages/ProgresoPage.jsx          → v1.1
frontend/src/pages/FichaMedicaPage.jsx       → v1.1
```

---

## División de trabajo — MVP1

### 👤 INTEGRANTE 1 — Jose Benjamin Alva Chacon `24200045`
**Módulos: Infraestructura + Auth + Socios + Membresías + Pagos**

| Fase | Archivos | Tiempo estimado |
|---|---|---|
| Base del servidor | `server.js`, `app.js`, `config/`, `utils/` (los 5) | Día 1–2 |
| Middlewares | `auth`, `roles`, `errorHandler`, `logger` | Día 2–3 |
| Auth completo | `Usuario.js`, `auth.controller`, `auth.routes` | Día 3–4 |
| Socios + Planes | Models + controllers + routes | Día 4–6 |
| Membresías + Pagos | Models + controllers + routes + `membresia.service` | Día 6–8 |
| QR básico | `qr.service.js`, `acceso.controller`, `LogAcceso.js` | Día 8–9 |
| Dashboard BE | `dashboard.controller`, `dashboard.service` | Día 9–10 |
| DB | `migrations/001` y `002`, seeds de planes y usuarios demo | Día 5 (paralelo) |

**Total estimado: 10 días**

---

### 👤 INTEGRANTE 2 — Josue Rodrigo Cordova Guerra `24200155`
**Módulos: Clases + Reservas + Penalizaciones (lógica de negocio core)**

| Fase | Archivos | Tiempo estimado |
|---|---|---|
| Validadores compartidos | `validate.middleware`, `validators.utils` | Día 1–2 |
| Clases | `ClaseGrupal.js`, `clase.controller`, `clases.routes` | Día 2–4 |
| Reservas | `Reserva.js`, `reserva.controller`, `reservas.routes` | Día 4–7 |
| Penalizaciones | `Penalizacion.js`, `penalizacion.service`, `penalizacion.controller`, routes | Día 7–9 |
| DB | `migrations/003` (clases + reservas + penalizaciones), seeds de clases | Día 5 (paralelo) |
| Tests críticos | `reserva.test.js`, `acceso.test.js` | Día 9–10 |

**Total estimado: 10 días**

> 🔴 **Dependencia:** Esperar que Int. 1 termine `models/Socio.js` y `models/Membresia.js` (día 4–5) antes de implementar `Reserva.js`.

---

### 👤 INTEGRANTE 3 — Erick Marco Sandoval Dominguez `24200172`
**Módulos: Frontend base + Admin (Login, Socios, Membresías, Pagos, Dashboard, Acceso QR)**

| Fase | Archivos | Tiempo estimado |
|---|---|---|
| Setup frontend | `package.json`, `vite.config`, `App.jsx`, `main.jsx`, `index.css` | Día 1 |
| Diseño global | Definir paleta, tipografía, variables CSS en `index.css` | Día 1–2 |
| Utils + Context | `utils/` (4 archivos), `AuthContext`, `NotificacionContext` | Día 2–3 |
| API base + Auth FE | `services/api.js`, `auth.service`, `hooks/useAuth` | Día 3–4 |
| Componentes common | Los 16 de `components/common/` | Día 3–5 |
| Auth UI | `LoginForm.jsx`, `ProtectedRoute.jsx`, `LoginPage.jsx` | Día 4–5 |
| Socios UI | `components/socios/` (5) + `SociosPage` + `SocioDetallePage` | Día 5–7 |
| Membresías + Pagos UI | `components/membresias/` (4) + `components/pagos/` (3) + `PagosPage` | Día 7–8 |
| Dashboard UI | `components/dashboard/` (5) + `DashboardPage` | Día 8–9 |
| Acceso QR UI | `components/acceso/` (3) + `AccesoQRPage` + `PlanesPage` | Día 9–10 |

**Total estimado: 10 días**

> 🔴 **Prioritario:** Terminar `components/common/` y `AuthContext.jsx` antes del día 5 para desbloquear al Int. 4.

---

### 👤 INTEGRANTE 4 — Alvaro Mathias Melendez Bustamante `24200166`
**Módulos: Frontend Socio (Clases, Reservas, Mi Perfil)**

| Fase | Archivos | Tiempo estimado |
|---|---|---|
| Servicios del socio | `clases.service`, `reservas.service`, `acceso.service` (hooks respectivos) | Día 1–3 *(con mocks mientras espera BE)* |
| Componentes Clases | `ClaseCard`, `ClaseList`, `ClaseForm`, `AforoIndicator`, `HorarioGrid` | Día 3–5 |
| Página Clases | `ClasesPage.jsx` | Día 5 |
| Componentes Reservas | `ReservaCard`, `ReservaList`, `ReservaModal`, `StrikesBadge`, `CancelacionModal` | Día 5–7 |
| Páginas Reservas | `ReservasPage.jsx`, `MisReservasPage.jsx` | Día 7–8 |
| Mi Perfil del Socio | `MiPerfilPage.jsx` (muestra QR + membresía activa + strikes) | Día 8–9 |
| `services/pagos.service` + hook | Para que el socio vea su historial | Día 9–10 |
| `NotFoundPage.jsx` | Página 404 | Día 10 |

**Total estimado: 10 días**

> 🟡 **Los días 1–3** puede trabajar con **datos mockeados** (JSON hardcodeados) mientras el backend del Int. 2 no esté listo. Así no se bloquea.

---

## Cronograma MVP1 — Vista general (3 semanas)

```
         Sem 1 (días 1–5)          Sem 2 (días 6–10)       Sem 3 (días 11–15)
────────────────────────────────────────────────────────────────────────────────
INT.1   ███ Config+Auth+Socios ████ Memb+Pagos+QR+Dashboard  ██ Integración
INT.2   ██ Validadores+Clases ████ Reservas+Penalizaciones ██ Tests+Integración
INT.3   ██ Setup+Common+Auth ████ Socios+Memb+Pagos UI ██ Dashboard+QR UI
INT.4   ███ Services mock ████ Clases+Reservas UI ██ MiPerfil+Integración
────────────────────────────────────────────────────────────────────────────────
         ↑ Sync 1: contrato API     ↑ Sync 2: BE+FE conectados  ↑ Demo interna
```

### Puntos de sincronización del MVP1

| Cuándo | Qué hacer |
|---|---|
| **Día 1 (HOY)** | Acordar API Contract ✅ (ya hecho) |
| **Día 3** | Int. 3 entrega `components/common/` → Int. 4 puede empezar sus componentes |
| **Día 5** | Int. 1 entrega `Socio.js` + `Membresia.js` → Int. 2 puede empezar `Reserva.js` |
| **Día 7** | Primera integración BE ↔ FE: reemplazar mocks del Int. 4 con API real |
| **Día 10** | Demo interna completa del flujo: login → registrar socio → pagar → QR → reservar clase |
| **Día 13–15** | Corrección de bugs, pulido visual, preparar demo para clase |

---

## Flujos demostrables al final del MVP1

Con este alcance, la demo de presentación puede mostrar:

1. **Login** con roles diferenciados (admin / recepcionista / socio)
2. **Registrar un socio nuevo** y que genere su QR automáticamente
3. **Registrar un pago** → membresía se activa → QR válido
4. **Escanear QR en recepción** → luz verde (membresía activa) o luz roja (vencida)
5. **Reservar una clase** desde la vista del socio (con validación de aforo)
6. **Ver el sistema de strikes** cuando un socio falta a una clase
7. **Dashboard del administrador** con las 3 métricas del dueño
8. **Membresía vencida bloquea** tanto el QR como la reserva de clases

---

## Resumen de carga MVP1

| Integrante | BE archivos | FE archivos | DB | Tests | Total |
|---|---|---|---|---|---|
| **Int. 1** — Alva Chacon | 26 | 0 | 3 | 1 | **~30** |
| **Int. 2** — Cordova Guerra | 12 | 0 | 2 | 2 | **~16** |
| **Int. 3** — Sandoval Dominguez | 0 | 52 | 0 | 0 | **~52** |
| **Int. 4** — Melendez Bustamante | 0 | 20 | 0 | 0 | **~20** |
| **TOTAL MVP1** | **38** | **72** | **5** | **3** | **~118** |
