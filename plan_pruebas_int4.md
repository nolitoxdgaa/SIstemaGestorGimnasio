# Plan de Pruebas Funcionales — Módulo Integrante 4
## Clases, Reservas y Mi Perfil

> **URL:** http://localhost:5173  
> **Convención:** ✅ Pasa | ❌ Falla | ⚠️ Comportamiento inesperado  

---

## Cuentas de prueba

| Rol | Email | Password |
|-----|-------|----------|
| Administrador | `admin@olympuscore.com` | `Demo1234` |
| Recepcionista | `recepcion@olympuscore.com` | `Demo1234` |
| Entrenador | `entrenador@olympuscore.com` | `Demo1234` |
| Socio | *(crear uno o usar existente con rol socio)* | `Demo1234` |

---

## Módulo 7 — Clases Grupales (`/clases`)

| ID | Escenario | Pasos | Resultado esperado |
|----|-----------|-------|--------------------|
| C-01 | Acceso universal | Login admin → `/clases` | Página carga con lista de clases (o estado vacío) |
| C-02 | Acceso entrenador | Login entrenador → `/clases` | Página carga correctamente (no redirige) |
| C-03 | Acceso socio | Login socio → `/clases` | Página carga con botones "Reservar" en cada clase |
| C-04 | Filtro por tipo | Seleccionar "Spinning" en dropdown | Solo muestra clases de tipo spinning |
| C-05 | Filtro por fecha | Poner fecha de hoy | Solo clases del día |
| C-06 | Filtro solo disponibles | Marcar "Solo con cupos" | Solo clases con aforoDisponible > 0 |
| C-07 | Crear clase (admin) | Admin → "➕ Nueva clase" → llenar todos los campos → "Crear clase" | Toast éxito, clase aparece en la lista |
| C-08 | Validación campos | "➕ Nueva clase" → sin nombre → "Crear clase" | Error "Nombre, instructor y fecha/hora son obligatorios" |
| C-09 | Sin botón crear | Login entrenador o socio → `/clases` | NO aparece botón "➕ Nueva clase" |
| C-10 | Aforo visual | Ver clase con cupos ocupados | Barra de aforo muestra porcentaje correcto con color (verde/amarillo/rojo) |

---

## Módulo 8 — Reservas Admin (`/reservas`)

| ID | Escenario | Pasos | Resultado esperado |
|----|-----------|-------|--------------------|
| R-01 | Bloqueo rol socio | Login socio → `/reservas` | Redirige a `/dashboard` |
| R-02 | Bloqueo entrenador | Login entrenador → `/reservas` | Redirige a `/dashboard` |
| R-03 | Listado admin | Login admin → `/reservas` | Tabla con todas las reservas del sistema |
| R-04 | Stat cards | Parte superior | Muestra total, confirmadas, asistencias, inasistencias |
| R-05 | Filtro estado | Seleccionar "Asistió" | Solo filas con estado "Asistió" |
| R-06 | Filtro fecha | Poner fecha → buscar | Solo reservas de ese día |
| R-07 | Buscar socio | Escribir nombre del socio en búsqueda | Filtra en tiempo real |
| R-08 | Registrar asistencia | Clase ya pasada + estado "confirmada" → clic ✔ | Estado cambia a "Asistió", desaparecen botones |
| R-09 | Registrar inasistencia | Clase pasada → clic ✕ | Estado cambia a "Inasistencia" |
| R-10 | Clase futura sin acciones | Reserva futura con estado confirmada | NO muestra botones ✔ / ✕ |

---

## Módulo 9 — Mis Reservas (`/mis-reservas`) — Vista Socio

| ID | Escenario | Pasos | Resultado esperado |
|----|-----------|-------|--------------------|
| MR-01 | Bloqueo admin | Login admin → `/mis-reservas` | Redirige a `/dashboard` |
| MR-02 | Tab Próximas | Login socio → `/mis-reservas` | Tab "Próximas" activo, lista de reservas confirmadas futuras |
| MR-03 | Tab Historial | Clic "Historial" | Muestra reservas pasadas / canceladas |
| MR-04 | Stat cards | Sección superior | Muestra conteo de próximas, asistencias e inasistencias |
| MR-05 | Cancelar reserva | Clic "Cancelar" en reserva próxima | Modal de confirmación aparece |
| MR-06 | Confirmar cancelación | Modal → "Sí, cancelar" | Toast "Reserva cancelada", desaparece de Próximas |
| MR-07 | Sin botón en historial | Ver reservas en tab Historial | NO aparece botón "Cancelar" en reservas ya pasadas |
| MR-08 | Estado visual | Reserva "Asistió" | Badge verde "Asistió" con emoji 🏆 |

---

## Módulo 10 — Mi Perfil (`/mi-perfil`) — Vista Socio

| ID | Escenario | Pasos | Resultado esperado |
|----|-----------|-------|--------------------|
| MP-01 | Bloqueo admin | Login admin → `/mi-perfil` | Redirige a `/dashboard` |
| MP-02 | Carga QR | Login socio → `/mi-perfil` | Imagen QR se genera y muestra correctamente |
| MP-03 | Copiar Token | Clic "📋 Copiar Token" | Botón cambia a "✓ Copiado" por 2 segundos |
| MP-04 | Descargar QR | Clic "⬇ Descargar QR" | Descarga imagen `.png` |
| MP-05 | Token válido en acceso | Copiar token → ir a `/acceso` → Ingresar token → Verificar | PERMITIDO ✅ (si membresía activa) |
| MP-06 | Membresía activa | Panel membresía | Muestra plan, estado "activa" y días restantes en verde |
| MP-07 | Color días restantes | Socio con ≤3 días | Días restantes en amarillo |
| MP-08 | Color días vencida | Socio con membresía vencida | Muestra "Vencida" en rojo |
| MP-09 | Sin membresía | Socio sin pago | Mensaje "No tienes membresía activa. Acércate a recepción…" |
| MP-10 | Strikes 0 | Socio sin strikes | Badge verde "Sin strikes" + 3 puntos grises |
| MP-11 | Strikes parciales | Socio con 2 strikes | Badge amarillo "2/3 strikes" + 2 puntos amarillos |
| MP-12 | Bloqueado | Socio con 3+ strikes bloqueado | Badge rojo "Bloqueado" + fecha de desbloqueo |
| MP-13 | Próximas clases | Panel inferior derecho | Lista reservas confirmadas futuras del socio |
| MP-14 | Sin reservas | Socio sin reservas | Mensaje con link a `/clases` |

---

## Flujos de integración completos (Módulo 4)

| ID | Flujo | Pasos resumidos | Resultado esperado |
|----|-------|-----------------|-------------------|
| F-04 | Ciclo reserva completo | Admin crea clase → Socio reserva → Admin registra asistencia → Ver en historial | Cada paso refleja el estado correcto |
| F-05 | Sistema de strikes | Socio tiene 2 inasistencias → Admin registra 3ra → Intentar reservar nueva clase | Error "Penalización activa" al intentar reservar |
| F-06 | Cancelación tardía | Socio intenta cancelar reserva <2h antes | Error "Solo puedes cancelar hasta 2 horas antes" |
| F-07 | Sin membresía bloquea | Socio sin membresía activa → Intentar reservar clase | Error "No puedes reservar con membresía vencida" |

---

## Checklist de Sidebar por rol

| Ítem del menú | Admin | Recepcionista | Entrenador | Socio |
|---------------|-------|---------------|------------|-------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Socios | ✅ | ✅ | ❌ | ❌ |
| Clases | ✅ | ✅ | ✅ | ✅ |
| Pagos | ✅ | ✅ | ❌ | ❌ |
| Acceso QR | ✅ | ✅ | ❌ | ❌ |
| Membresías | ✅ | ✅ | ❌ | ❌ |
| Reservas | ✅ | ✅ | ❌ | ❌ |
| Mis Reservas | ❌ | ❌ | ❌ | ✅ |
| Mi Perfil | ❌ | ❌ | ❌ | ✅ |

---

## Plantilla de reporte de bug

```
ID de prueba  : [ej. C-07]
Navegador     : Chrome / Edge
Pasos exactos : [qué hiciste paso a paso]
Resultado real: [qué viste]
Esperado      : [qué debería pasar]
Error consola  : [F12 → Console]
Error Network  : [F12 → Network → URL + status code]
URL actual    : [ej. http://localhost:5173/clases]
```
