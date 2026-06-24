# Plan de Pruebas Funcionales — OLYMPUS CORE MVP1

> **URL:** http://localhost:5173  
> **Convención:** ✅ Pasa | ❌ Falla | ⚠️ Comportamiento inesperado  
> Ante cualquier falla, anota el mensaje en la consola del navegador (F12 → Console).

---

## Herramienta de diagnóstico rápido

Antes de cada prueba abre **F12 → pestaña Network → filtra por Fetch/XHR**.  
Cada petición al backend debe mostrar:
- `200` → éxito
- `400/401/403/409` → error controlado (el frontend debe mostrarlo)
- `500` → bug en backend (reportar)

---

## Módulo 1 — Autenticación

| ID | Escenario | Pasos | Resultado esperado |
|----|-----------|-------|--------------------|
| L-01 | Login vacío | Ir a `/login`, no llenar nada, Enter | Botón desactivado O mensaje "Completa todos los campos" |
| L-02 | Email inválido | `noesuncorreo` + cualquier contraseña → Iniciar sesión | Mensaje de error visible |
| L-03 | Contraseña incorrecta | `admin@olympuscore.com` + `wrongpass` | Alert rojo "Credenciales incorrectas" |
| L-04 | Login admin | `admin@olympuscore.com` / `Demo1234` → Enter | Redirección a `/dashboard`, sidebar con TODOS los módulos |
| L-05 | Login recepcionista | `recepcion@olympuscore.com` / `Demo1234` | Dashboard carga, sidebar muestra Pagos y Acceso QR |
| L-06 | Login entrenador | `entrenador@olympuscore.com` / `Demo1234` | Dashboard carga, **SIN** Pagos ni Acceso QR en sidebar |
| L-07 | Logout | Clic "Cerrar sesión" en sidebar | Redirige a `/login` |
| L-08 | Sesión persistida | Login → cerrar pestaña → abrir `localhost:5173` | Vuelve directo al Dashboard |
| L-09 | Protección de ruta | Sin login → ir a `localhost:5173/dashboard` | Redirige a `/login` |

---

## Módulo 2 — Dashboard (solo Admin)

| ID | Escenario | Pasos | Resultado esperado |
|----|-----------|-------|--------------------|
| D-01 | Carga inicial | Login admin → `/dashboard` | 4 stat cards: Ingresos hoy, Socios activos, Vencen en 3 días, Clases hoy |
| D-02 | Datos reales | Card "Socios activos" | Muestra al menos 1 (el socio demo) |
| D-03 | Membresías por vencer | Panel derecho | Lista vacía o con socios próximos a vencer |
| D-04 | Botón Actualizar | Clic "↻ Actualizar" | Datos se recargan sin reload completo |
| D-05 | Gráfica vacía | Panel inferior izquierdo | Mensaje "Sin clases programadas hoy" |
| D-06 | Acceso entrenador | Login entrenador → ir a `/dashboard` | Dashboard carga exitosamente con datos reales |

---

## Módulo 3 — Socios

| ID | Escenario | Pasos | Resultado esperado |
|----|-----------|-------|--------------------|
| S-01 | Listar socios | `/socios` | Grid de cards |
| S-02 | Buscar por nombre | Escribir "Juan" | Filtra en tiempo real |
| S-03 | Buscar por DNI | Escribir `12345678` | Muestra el socio demo |
| S-04 | Crear socio válido | "+ Nuevo Socio" → llenar todos los campos → Guardar | Toast "Socio registrado correctamente", aparece en grid |
| S-05 | Validación DNI corto | DNI con 7 dígitos → Guardar | "El DNI debe tener exactamente 8 dígitos" |
| S-06 | Validación email | Email sin @ → Guardar | "El email no tiene un formato válido" |
| S-07 | DNI duplicado | DNI `12345678` (ya existe) → Guardar | Error del servidor visible en el modal |
| S-08 | Editar socio | Card → ✏️ → cambiar teléfono → Guardar | Toast "Datos actualizados" |
| S-09 | Generar QR | Card → botón "QR" | Modal con imagen QR sobre fondo blanco |
| S-10 | Descargar QR | Modal QR → "⬇ Descargar QR" | Descarga imagen `.png` |
| S-11 | Pago desde card | Card → "💳 Pago" | Modal con selector de plan y total |
| S-12 | Paginación | Con 13+ socios en BD | Controles de página aparecen debajo del grid |

---

## Módulo 4 — Pagos (Admin / Recepcionista)

| ID | Escenario | Pasos | Resultado esperado |
|----|-----------|-------|--------------------|
| P-01 | Bloqueo por rol | Login entrenador → `/pagos` | Redirige a `/dashboard` |
| P-02 | Historial | Login admin → `/pagos` | Tabla con pagos registrados |
| P-03 | Total acumulado | Stat card superior | Suma correcta de todos los montos visibles |
| P-04 | Filtro método | Seleccionar "efectivo" → Aplicar | Solo pagos en efectivo |
| P-05 | Filtro fechas | Poner fecha de hoy en ambos campos | Solo pagos de hoy |
| P-06 | Buscar socio por DNI | "+ Nuevo pago" → DNI `12345678` → 🔍 | Panel verde con nombre del socio |
| P-07 | DNI inválido | DNI de 5 dígitos → 🔍 | "DNI debe tener 8 dígitos" |
| P-08 | DNI inexistente | DNI `99999999` → 🔍 | "No se encontró un socio con ese DNI" |
| P-09 | Pago completo | Buscar socio → Plan Mensual → Efectivo → Confirmar | Toast éxito, fila nueva en tabla |
| P-10 | Cálculo dinámico | Cambiar plan a "Plan Anual" | Total cambia a S/ 850.00 |

---

## Módulo 5 — Membresías

| ID | Escenario | Pasos | Resultado esperado |
|----|-----------|-------|--------------------|
| M-01 | Tab Activas | `/membresias` → "✅ Activas" | Tabla con socios con membresía vigente |
| M-02 | Tab Por vencer | "⚠️ Por vencer (3d)" | Socios cuya membresía vence en ≤3 días |
| M-03 | Tab Vencidas | "❌ Vencidas" | Socios con membresía expirada |
| M-04 | Días restantes | Columna "Días restantes" | Verde si >3d, amarillo si ≤3d, rojo si vencida |
| M-05 | Counters correctos | Badge numérico en cada tab | Coincide con filas de la tabla |

---

## Módulo 6 — Acceso QR (Admin / Recepcionista)

| ID | Escenario | Pasos | Resultado esperado |
|----|-----------|-------|--------------------|
| A-01 | Bloqueo por rol | Login entrenador → `/acceso` | Redirige a `/dashboard` |
| A-02 | Modo manual | Clic "⌨️ Ingresar token" | Textarea habilitada |
| A-03 | Botón desactivado | Textarea vacía → "Verificar acceso" | Botón está en `disabled` |
| A-04 | Token basura | Pegar `abc123` → Verificar | **DENEGADO** — motivo "QR inválido o expirado" |
| A-05 | Token válido | Socios → QR del socio con membresía activa → copiar token → Acceso → pegar → Verificar | **PERMITIDO ✅** con nombre y fecha |
| A-06 | Membresía vencida | QR de socio sin membresía → pegar → Verificar | **DENEGADO** — motivo "Membresía vencida" |
| A-07 | Log actualizado | Después de A-05 y A-06 | Panel "Accesos recientes" muestra ambos intentos con hora |
| A-08 | Modo escáner | Clic "📷 Modo escáner" | Animación de línea azul en el frame |

---

## Flujos de integración completos

| ID | Flujo | Pasos resumidos | Resultado esperado |
|----|-------|-----------------|-------------------|
| F-01 | Ciclo completo de socio | Crear socio → Registrar pago → Verificar en Membresías → Generar QR → Validar acceso | Cada paso muestra el estado correcto |
| F-02 | Socio sin membresía | Crear socio (sin pago) → Generar QR → Validar en Acceso | DENEGADO "Membresía vencida" |
| F-03 | Consistencia | Registrar pago → Membresías tab Activas → Dashboard "Socios activos" | Datos coherentes en los 3 módulos |

---

## Plantilla de reporte de bug

Cuando algo falle, copia y llena esto:

```
ID de prueba  : [ej. L-04]
Navegador     : Chrome / Edge / Firefox
Pasos exactos : [qué hiciste paso a paso]
Resultado real: [qué viste realmente]
Esperado      : [qué debería haber pasado]
Error consola  : [F12 → Console → pega el mensaje]
Error Network  : [F12 → Network → URL de la petición + status code]
URL actual    : [ej. http://localhost:5173/socios]
```
