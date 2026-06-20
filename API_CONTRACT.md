# 🔗 OLYMPUS CORE — Contrato de API v1.0

> **Documento de sincronización obligatoria — Día 1**  
> Este archivo define la "ley" de comunicación entre frontend y backend.  
> **Nadie programa ni una línea hasta que todos estén de acuerdo con este documento.**  
> Ubicación en el repo: `API_CONTRACT.md` (raíz del proyecto)

---

## 1. Convenciones Globales

### Base URL
```
Desarrollo:   http://localhost:3001/api/v1
Producción:   https://<dominio>/api/v1
```

### Formato de respuesta — SIEMPRE el mismo

**✅ Éxito**
```json
{
  "success": true,
  "message": "Descripción legible del resultado",
  "data": { }
}
```

**❌ Error**
```json
{
  "success": false,
  "message": "Descripción legible del error",
  "error": "CODIGO_ERROR_INTERNO",
  "details": [ ]
}
```

> `details` es un array de strings, se usa para errores de validación (campos inválidos).  
> `data` puede ser un objeto `{}`, un array `[]`, o `null`.

### Códigos HTTP utilizados

| Código | Cuándo usarlo |
|---|---|
| `200 OK` | Lectura o actualización exitosa |
| `201 Created` | Creación exitosa |
| `204 No Content` | Eliminación exitosa |
| `400 Bad Request` | Datos inválidos o regla de negocio violada |
| `401 Unauthorized` | Token ausente o inválido |
| `403 Forbidden` | Token válido pero sin el rol requerido |
| `404 Not Found` | Recurso no encontrado |
| `409 Conflict` | Conflicto de datos (ej. DNI duplicado, cupo lleno) |
| `500 Internal Server Error` | Error inesperado del servidor |

### Autenticación JWT

Todos los endpoints protegidos requieren el header:
```
Authorization: Bearer <token>
```

El token contiene el payload:
```json
{
  "id": 1,
  "rol": "administrador",
  "nombre": "Jose Alva",
  "iat": 1718000000,
  "exp": 1718086400
}
```

### Roles del sistema

| Rol (string exacto) | Acceso |
|---|---|
| `"administrador"` | Todo el sistema |
| `"recepcionista"` | Socios, pagos, acceso QR |
| `"entrenador"` | Rutinas, progreso, ficha médica |
| `"socio"` | Autogestión (reservas, mi rutina, mi perfil) |

---

## 2. Módulo: Autenticación (`/auth`)

### `POST /auth/login`
**Acceso:** Público

**Request:**
```json
{
  "email": "admin@olympuscore.com",
  "password": "MiPassword123"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "usuario": {
      "id": 1,
      "nombre": "Jose Alva",
      "email": "admin@olympuscore.com",
      "rol": "administrador"
    }
  }
}
```

**Response 401:**
```json
{
  "success": false,
  "message": "Credenciales incorrectas",
  "error": "INVALID_CREDENTIALS"
}
```

**Response 429 (bloqueo tras 5 intentos):**
```json
{
  "success": false,
  "message": "Cuenta bloqueada por 30 minutos por múltiples intentos fallidos",
  "error": "ACCOUNT_LOCKED"
}
```

---

### `POST /auth/logout`
**Acceso:** Autenticado (cualquier rol)

**Request:** *(sin body, solo el header Authorization)*

**Response 200:**
```json
{
  "success": true,
  "message": "Sesión cerrada correctamente",
  "data": null
}
```

---

## 3. Módulo: Socios (`/socios`)

### Modelo de Socio (objeto completo)
```json
{
  "id": 1,
  "nombre": "Carlos Pérez",
  "apellido": "López",
  "dni": "12345678",
  "email": "carlos@email.com",
  "telefono": "987654321",
  "fechaNacimiento": "1995-04-15",
  "fechaRegistro": "2026-01-10T08:00:00Z",
  "estado": "activo",
  "membresia": {
    "id": 5,
    "planNombre": "Plan Mensual",
    "estado": "activa",
    "fechaInicio": "2026-06-01",
    "fechaFin": "2026-06-30"
  },
  "strikes": 1,
  "fichaMedicaCompleta": true
}
```

> `estado` del socio: `"activo"` | `"inactivo"`  
> `estado` de membresía: `"activa"` | `"vencida"` | `"bloqueada"`

---

### `GET /socios`
**Acceso:** `administrador`, `recepcionista`

**Query params opcionales:**
```
?busqueda=carlos        ← busca por nombre, apellido o DNI
?estado=activo          ← filtra por estado del socio
?membresiaEstado=activa ← filtra por estado de membresía
?pagina=1               ← paginación (default: 1)
?limite=20              ← resultados por página (default: 20)
```

**Response 200:**
```json
{
  "success": true,
  "message": "Socios obtenidos correctamente",
  "data": {
    "socios": [ { ...objeto socio... } ],
    "total": 500,
    "pagina": 1,
    "limite": 20,
    "totalPaginas": 25
  }
}
```

---

### `GET /socios/:id`
**Acceso:** `administrador`, `recepcionista`, `entrenador`

**Response 200:**
```json
{
  "success": true,
  "message": "Socio encontrado",
  "data": { ...objeto socio completo... }
}
```

**Response 404:**
```json
{
  "success": false,
  "message": "Socio no encontrado",
  "error": "SOCIO_NOT_FOUND"
}
```

---

### `POST /socios`
**Acceso:** `administrador`, `recepcionista`

**Request:**
```json
{
  "nombre": "Carlos",
  "apellido": "Pérez",
  "dni": "12345678",
  "email": "carlos@email.com",
  "telefono": "987654321",
  "fechaNacimiento": "1995-04-15",
  "planId": 2
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Socio registrado exitosamente",
  "data": {
    "socio": { ...objeto socio... },
    "codigoQR": "data:image/png;base64,..."
  }
}
```

**Response 409 (DNI duplicado):**
```json
{
  "success": false,
  "message": "Ya existe un socio con ese DNI",
  "error": "DNI_ALREADY_EXISTS"
}
```

**Response 400 (validación):**
```json
{
  "success": false,
  "message": "Datos inválidos",
  "error": "VALIDATION_ERROR",
  "details": ["El campo 'dni' debe tener 8 dígitos", "El email no es válido"]
}
```

---

### `PUT /socios/:id`
**Acceso:** `administrador`, `recepcionista`

**Request:** *(solo los campos a actualizar)*
```json
{
  "telefono": "999888777",
  "email": "nuevo@email.com"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Información del socio actualizada",
  "data": { ...objeto socio actualizado... }
}
```

---

### `DELETE /socios/:id`
**Acceso:** `administrador`

**Response 200:**
```json
{
  "success": true,
  "message": "Socio desactivado del sistema",
  "data": null
}
```

> ⚠️ No se elimina físicamente de la BD, solo cambia `estado` a `"inactivo"`.

---

### `GET /socios/:id/qr`
**Acceso:** `administrador`, `recepcionista`, o el mismo `socio`

**Response 200:**
```json
{
  "success": true,
  "message": "Código QR generado",
  "data": {
    "codigoQR": "data:image/png;base64,...",
    "token": "qr-token-encriptado",
    "expiracion": "2026-06-21T08:00:00Z"
  }
}
```

---

## 4. Módulo: Planes (`/planes`)

### Modelo de Plan
```json
{
  "id": 1,
  "nombre": "Plan Mensual",
  "descripcion": "Acceso ilimitado por 30 días",
  "duracionDias": 30,
  "precio": 100.00,
  "activo": true
}
```

### `GET /planes`
**Acceso:** Todos (autenticados)

**Response 200:**
```json
{
  "success": true,
  "message": "Planes obtenidos",
  "data": {
    "planes": [ { ...objeto plan... } ]
  }
}
```

---

## 5. Módulo: Membresías (`/membresias`)

### Modelo de Membresía
```json
{
  "id": 5,
  "socioId": 1,
  "planId": 2,
  "planNombre": "Plan Mensual",
  "fechaInicio": "2026-06-01",
  "fechaFin": "2026-06-30",
  "estado": "activa",
  "precio": 100.00,
  "creadaEn": "2026-06-01T09:00:00Z"
}
```

### `GET /membresias`
**Acceso:** `administrador`, `recepcionista`

**Query params:**
```
?socioId=1
?estado=vencida
?venceEn=3          ← membresías que vencen en los próximos N días
```

**Response 200:**
```json
{
  "success": true,
  "message": "Membresías obtenidas",
  "data": {
    "membresias": [ { ...objeto membresía... } ]
  }
}
```

---

### `GET /membresias/:id`
**Acceso:** `administrador`, `recepcionista`

**Response 200:**
```json
{
  "success": true,
  "message": "Membresía encontrada",
  "data": { ...objeto membresía... }
}
```

---

### `POST /membresias` *(Renovar o crear membresía)*
**Acceso:** `administrador`, `recepcionista`

**Request:**
```json
{
  "socioId": 1,
  "planId": 2,
  "pagoId": 10
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Membresía activada correctamente",
  "data": { ...objeto membresía... }
}
```

---

## 6. Módulo: Acceso QR (`/acceso`)

### `POST /acceso/validar`
**Acceso:** `recepcionista` (o sistema del torniquete)

**Request:**
```json
{
  "tokenQR": "qr-token-encriptado-del-socio"
}
```

**Response 200 — Acceso permitido:**
```json
{
  "success": true,
  "message": "Acceso permitido",
  "data": {
    "resultado": "PERMITIDO",
    "socio": {
      "id": 1,
      "nombre": "Carlos Pérez",
      "foto": null
    },
    "membresia": {
      "estado": "activa",
      "fechaFin": "2026-06-30"
    },
    "registradoEn": "2026-06-20T14:35:00Z"
  }
}
```

**Response 200 — Acceso denegado (membresía vencida):**
```json
{
  "success": true,
  "message": "Acceso denegado",
  "data": {
    "resultado": "DENEGADO",
    "motivo": "MEMBRESIA_VENCIDA",
    "socio": { "id": 1, "nombre": "Carlos Pérez" },
    "membresia": {
      "estado": "vencida",
      "fechaFin": "2026-05-31"
    }
  }
}
```

**Response 200 — Acceso denegado (bloqueado por strikes):**
```json
{
  "success": true,
  "message": "Acceso denegado",
  "data": {
    "resultado": "DENEGADO",
    "motivo": "PENALIZACION_ACTIVA",
    "socio": { "id": 1, "nombre": "Carlos Pérez" },
    "penalizacion": {
      "strikes": 3,
      "bloqueadoHasta": "2026-06-27T00:00:00Z"
    }
  }
}
```

> ⚠️ El endpoint siempre responde `200`. El campo `resultado` es `"PERMITIDO"` o `"DENEGADO"`.  
> El frontend decide qué mostrar (luz verde o roja).

---

### `GET /acceso/logs`
**Acceso:** `administrador`, `recepcionista`

**Query params:**
```
?socioId=1
?fecha=2026-06-20
?resultado=DENEGADO
?pagina=1&limite=50
```

**Response 200:**
```json
{
  "success": true,
  "message": "Logs de acceso obtenidos",
  "data": {
    "logs": [
      {
        "id": 101,
        "socioId": 1,
        "socioNombre": "Carlos Pérez",
        "resultado": "PERMITIDO",
        "motivo": null,
        "registradoEn": "2026-06-20T08:10:00Z"
      }
    ],
    "total": 320,
    "pagina": 1
  }
}
```

---

## 7. Módulo: Clases Grupales (`/clases`)

### Modelo de Clase
```json
{
  "id": 1,
  "tipo": "spinning",
  "nombre": "Spinning Intensivo",
  "descripcion": "Clase de ciclismo indoor de alta intensidad",
  "instructor": "Prof. María Torres",
  "fechaHora": "2026-06-21T18:00:00Z",
  "duracionMinutos": 60,
  "aforoMaximo": 20,
  "aforoDisponible": 7,
  "estado": "disponible"
}
```

> `tipo`: `"spinning"` | `"crossfit"`  
> `estado`: `"disponible"` | `"llena"` | `"cancelada"`

---

### `GET /clases`
**Acceso:** Todos (autenticados)

**Query params:**
```
?tipo=spinning
?fecha=2026-06-21       ← filtra por día
?disponibles=true       ← solo clases con cupos
```

**Response 200:**
```json
{
  "success": true,
  "message": "Clases obtenidas",
  "data": {
    "clases": [ { ...objeto clase... } ]
  }
}
```

---

### `GET /clases/:id`
**Acceso:** Todos (autenticados)

**Response 200:**
```json
{
  "success": true,
  "message": "Clase encontrada",
  "data": { ...objeto clase... }
}
```

---

### `POST /clases`
**Acceso:** `administrador`

**Request:**
```json
{
  "tipo": "spinning",
  "nombre": "Spinning Intensivo",
  "descripcion": "Clase de ciclismo indoor",
  "instructor": "Prof. María Torres",
  "fechaHora": "2026-06-21T18:00:00Z",
  "duracionMinutos": 60,
  "aforoMaximo": 20
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Clase creada exitosamente",
  "data": { ...objeto clase... }
}
```

---

### `PUT /clases/:id`
**Acceso:** `administrador`

**Response 200:**
```json
{
  "success": true,
  "message": "Clase actualizada",
  "data": { ...objeto clase actualizado... }
}
```

---

### `DELETE /clases/:id`
**Acceso:** `administrador`

**Response 200:**
```json
{
  "success": true,
  "message": "Clase cancelada",
  "data": null
}
```

---

## 8. Módulo: Reservas (`/reservas`)

### Modelo de Reserva
```json
{
  "id": 42,
  "socioId": 1,
  "socioNombre": "Carlos Pérez",
  "claseId": 5,
  "claseNombre": "Spinning Intensivo",
  "claseHora": "2026-06-21T18:00:00Z",
  "estado": "confirmada",
  "creadaEn": "2026-06-20T10:00:00Z"
}
```

> `estado`: `"confirmada"` | `"cancelada"` | `"asistio"` | `"inasistencia"`

---

### `GET /reservas`
**Acceso:** `administrador`, `recepcionista`

**Query params:**
```
?socioId=1
?claseId=5
?estado=confirmada
?fecha=2026-06-21
```

**Response 200:**
```json
{
  "success": true,
  "message": "Reservas obtenidas",
  "data": {
    "reservas": [ { ...objeto reserva... } ]
  }
}
```

---

### `GET /socios/:id/reservas`
**Acceso:** `administrador`, `recepcionista`, o el mismo `socio`

**Response 200:**
```json
{
  "success": true,
  "message": "Reservas del socio obtenidas",
  "data": {
    "reservas": [ { ...objeto reserva... } ]
  }
}
```

---

### `POST /reservas`
**Acceso:** `socio`, `recepcionista`

**Request:**
```json
{
  "socioId": 1,
  "claseId": 5
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Reserva registrada exitosamente",
  "data": { ...objeto reserva... }
}
```

**Response 409 — Cupo lleno:**
```json
{
  "success": false,
  "message": "No hay cupos disponibles en esta clase",
  "error": "CLASE_SIN_CUPOS"
}
```

**Response 400 — Membresía vencida:**
```json
{
  "success": false,
  "message": "No puedes reservar con membresía vencida",
  "error": "MEMBRESIA_VENCIDA"
}
```

**Response 400 — Penalización activa:**
```json
{
  "success": false,
  "message": "Tienes reservas bloqueadas hasta el 27/06/2026",
  "error": "PENALIZACION_ACTIVA",
  "details": ["Strikes acumulados: 3", "Desbloqueado el: 2026-06-27"]
}
```

**Response 409 — Horario duplicado:**
```json
{
  "success": false,
  "message": "Ya tienes una reserva en ese horario",
  "error": "HORARIO_DUPLICADO"
}
```

---

### `DELETE /reservas/:id/cancelar`
**Acceso:** `socio` (el dueño), `recepcionista`, `administrador`

**Response 200:**
```json
{
  "success": true,
  "message": "Reserva cancelada correctamente",
  "data": null
}
```

**Response 400 — Fuera de plazo:**
```json
{
  "success": false,
  "message": "Solo puedes cancelar hasta 2 horas antes del inicio de la clase",
  "error": "CANCELACION_FUERA_DE_PLAZO"
}
```

---

## 9. Módulo: Penalizaciones (`/socios/:id/strikes`)

### `GET /socios/:id/strikes`
**Acceso:** `administrador`, `recepcionista`, `entrenador`, o el mismo `socio`

**Response 200:**
```json
{
  "success": true,
  "message": "Strikes del socio obtenidos",
  "data": {
    "socioId": 1,
    "strikesActivos": 2,
    "strikesMaximos": 3,
    "bloqueado": false,
    "bloqueadoHasta": null,
    "historial": [
      {
        "id": 1,
        "claseId": 5,
        "claseNombre": "Spinning Intensivo",
        "fecha": "2026-06-10T18:00:00Z",
        "tipo": "inasistencia"
      }
    ]
  }
}
```

---

### `DELETE /socios/:id/strikes/:strikeId`
**Acceso:** `administrador`  
*(Remover un strike con justificación)*

**Request:**
```json
{
  "justificacion": "Baja médica presentada con certificado"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Strike removido con justificación registrada",
  "data": null
}
```

---

## 10. Módulo: Pagos (`/pagos`)

### Modelo de Pago
```json
{
  "id": 10,
  "socioId": 1,
  "socioNombre": "Carlos Pérez",
  "planId": 2,
  "planNombre": "Plan Mensual",
  "monto": 100.00,
  "metodoPago": "efectivo",
  "estado": "completado",
  "comprobante": "REC-2026-00010",
  "registradoPor": "recepcionista@olympus.com",
  "creadoEn": "2026-06-01T09:00:00Z"
}
```

> `metodoPago`: `"efectivo"` | `"yape"` | `"plin"` | `"tarjeta"`  
> `estado`: `"completado"` | `"anulado"`

---

### `GET /pagos`
**Acceso:** `administrador`

**Query params:**
```
?socioId=1
?fechaDesde=2026-06-01
?fechaHasta=2026-06-30
?metodoPago=efectivo
```

**Response 200:**
```json
{
  "success": true,
  "message": "Pagos obtenidos",
  "data": {
    "pagos": [ { ...objeto pago... } ],
    "totalMonto": 5000.00
  }
}
```

---

### `GET /socios/:id/pagos`
**Acceso:** `administrador`, `recepcionista`, o el mismo `socio`

**Response 200:**
```json
{
  "success": true,
  "message": "Historial de pagos del socio",
  "data": {
    "pagos": [ { ...objeto pago... } ]
  }
}
```

---

### `POST /pagos`
**Acceso:** `administrador`, `recepcionista`

**Request:**
```json
{
  "socioId": 1,
  "planId": 2,
  "monto": 100.00,
  "metodoPago": "efectivo"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Pago registrado y membresía activada",
  "data": {
    "pago": { ...objeto pago... },
    "membresia": { ...objeto membresía activada... }
  }
}
```

---

## 11. Módulo: Ficha Médica (`/socios/:id/ficha`)

### Modelo de Ficha Médica
```json
{
  "id": 3,
  "socioId": 1,
  "lesiones": "Lesión de rodilla derecha (2022)",
  "enfermedadesCardiovasculares": "Ninguna",
  "objetivo": "hipertrofia",
  "observaciones": "Evitar ejercicios de alto impacto",
  "completada": true,
  "actualizadaEn": "2026-06-01T10:00:00Z"
}
```

> `objetivo`: `"hipertrofia"` | `"perdida_peso"` | `"resistencia"` | `"rehabilitacion"` | `"otro"`

---

### `GET /socios/:id/ficha`
**Acceso:** `administrador`, `entrenador`, o el mismo `socio`

**Response 200:**
```json
{
  "success": true,
  "message": "Ficha médica obtenida",
  "data": { ...objeto ficha médica... }
}
```

**Response 404:**
```json
{
  "success": false,
  "message": "El socio aún no ha completado su ficha médica",
  "error": "FICHA_MEDICA_INCOMPLETA"
}
```

---

### `POST /socios/:id/ficha`
**Acceso:** `socio` (el mismo), `entrenador`, `administrador`

**Request:**
```json
{
  "lesiones": "Lesión de rodilla derecha (2022)",
  "enfermedadesCardiovasculares": "Ninguna",
  "objetivo": "hipertrofia",
  "observaciones": "Evitar ejercicios de alto impacto"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Ficha médica registrada correctamente",
  "data": { ...objeto ficha médica... }
}
```

---

### `PUT /socios/:id/ficha`
**Acceso:** `socio` (el mismo), `entrenador`, `administrador`

**Response 200:**
```json
{
  "success": true,
  "message": "Ficha médica actualizada",
  "data": { ...objeto ficha médica actualizada... }
}
```

---

## 12. Módulo: Rutinas (`/rutinas` y `/socios/:id/rutina`)

### Modelo de Rutina
```json
{
  "id": 7,
  "nombre": "Hipertrofia Nivel 1",
  "descripcion": "Rutina de fuerza para principiantes",
  "categoria": "fuerza",
  "ejercicios": [
    {
      "id": 1,
      "nombre": "Sentadilla",
      "series": 4,
      "repeticiones": 12,
      "descansoSegundos": 60,
      "observaciones": "Mantener espalda recta"
    }
  ],
  "creadaEn": "2026-05-01T00:00:00Z"
}
```

---

### `GET /rutinas`
**Acceso:** `administrador`, `entrenador`

**Response 200:**
```json
{
  "success": true,
  "message": "Rutinas obtenidas",
  "data": {
    "rutinas": [ { ...objeto rutina sin ejercicios... } ]
  }
}
```

---

### `GET /socios/:id/rutina`
**Acceso:** `administrador`, `entrenador`, o el mismo `socio`

**Response 200:**
```json
{
  "success": true,
  "message": "Rutina del socio obtenida",
  "data": { ...objeto rutina completo con ejercicios... }
}
```

**Response 400 — Sin ficha médica:**
```json
{
  "success": false,
  "message": "El socio debe completar su ficha médica antes de recibir una rutina",
  "error": "FICHA_MEDICA_REQUERIDA"
}
```

---

### `POST /socios/:id/rutina`
**Acceso:** `entrenador`, `administrador`

**Request:**
```json
{
  "rutinaId": 7
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Rutina asignada al socio",
  "data": {
    "socioId": 1,
    "rutina": { ...objeto rutina... }
  }
}
```

---

## 13. Módulo: Progreso Físico (`/socios/:id/progreso`)

### Modelo de Progreso
```json
{
  "id": 15,
  "socioId": 1,
  "ejercicioId": 1,
  "ejercicioNombre": "Sentadilla",
  "pesoKg": 80.0,
  "repeticionesLogradas": 12,
  "observaciones": "Buena técnica, listo para subir peso",
  "registradoPor": "entrenador@olympus.com",
  "fecha": "2026-06-20T09:00:00Z"
}
```

---

### `GET /socios/:id/progreso`
**Acceso:** `administrador`, `entrenador`, o el mismo `socio`

**Query params:**
```
?ejercicioId=1
?fechaDesde=2026-06-01
```

**Response 200:**
```json
{
  "success": true,
  "message": "Progreso del socio obtenido",
  "data": {
    "progreso": [ { ...objeto progreso... } ]
  }
}
```

---

### `POST /socios/:id/progreso`
**Acceso:** `entrenador`, `socio` (el mismo), `administrador`

**Request:**
```json
{
  "ejercicioId": 1,
  "pesoKg": 82.5,
  "repeticionesLogradas": 10,
  "observaciones": "Subió 2.5kg respecto a la semana pasada"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Progreso registrado",
  "data": { ...objeto progreso... }
}
```

---

## 14. Módulo: Dashboard (`/dashboard`)

### `GET /dashboard/resumen`
**Acceso:** `administrador`

**Response 200:**
```json
{
  "success": true,
  "message": "Resumen del dashboard obtenido",
  "data": {
    "ingresosDiarios": {
      "monto": 500.00,
      "cantidadPagos": 5,
      "fecha": "2026-06-20"
    },
    "membresiasPorVencer": {
      "cantidad": 8,
      "socios": [
        {
          "id": 3,
          "nombre": "Ana García",
          "fechaFin": "2026-06-22"
        }
      ]
    },
    "ocupacionClases": {
      "hoy": [
        {
          "claseId": 1,
          "nombre": "Spinning 6pm",
          "aforoMaximo": 20,
          "aforoOcupado": 15,
          "porcentaje": 75
        }
      ]
    },
    "totalSociosActivos": 487,
    "actualizadoEn": "2026-06-20T14:00:00Z"
  }
}
```

---

## 15. Tabla de errores internos (códigos `error`)

| Código | Descripción |
|---|---|
| `VALIDATION_ERROR` | Campos inválidos o faltantes |
| `INVALID_CREDENTIALS` | Email o contraseña incorrectos |
| `ACCOUNT_LOCKED` | Bloqueado por múltiples intentos |
| `TOKEN_EXPIRED` | JWT vencido |
| `TOKEN_INVALID` | JWT malformado |
| `FORBIDDEN` | Sin permiso para el recurso |
| `SOCIO_NOT_FOUND` | Socio no existe |
| `DNI_ALREADY_EXISTS` | DNI ya registrado |
| `MEMBRESIA_VENCIDA` | Membresía no activa |
| `PENALIZACION_ACTIVA` | Bloqueado por strikes |
| `CLASE_SIN_CUPOS` | Aforo lleno |
| `HORARIO_DUPLICADO` | Ya existe reserva en ese horario |
| `CANCELACION_FUERA_DE_PLAZO` | Cancelación fuera de las 2h |
| `FICHA_MEDICA_INCOMPLETA` | Ficha médica no completada |
| `FICHA_MEDICA_REQUERIDA` | Requiere ficha para continuar |
| `INTERNAL_ERROR` | Error inesperado del servidor |

---

## 16. Variables de entorno requeridas

### `backend/.env.example`
```env
# Servidor
PORT=3001
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=olympus_core
DB_USER=postgres
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=clave_secreta_muy_larga_y_segura
JWT_EXPIRES_IN=24h

# QR
QR_SECRET=clave_para_qr

# Intentos de login
MAX_LOGIN_ATTEMPTS=5
LOGIN_BLOCK_MINUTES=30
```

### `frontend/.env.example`
```env
VITE_API_URL=http://localhost:3001/api/v1
```

---

## 17. Checklist de validación del contrato

Antes de cerrar este documento como "aprobado", cada integrante debe confirmar:

- [ ] **Int. 1 — Alva Chacon:** Confirmo que puedo implementar todos los endpoints de Auth, Socios, Membresías, Pagos, Acceso QR y Dashboard con esta especificación
- [ ] **Int. 2 — Cordova Guerra:** Confirmo que puedo implementar todos los endpoints de Clases, Reservas, Penalizaciones, Rutinas, Progreso y Ficha Médica con esta especificación
- [ ] **Int. 3 — Sandoval Dominguez:** Confirmo que el frontend Admin puede consumir esta API sin ambigüedades
- [ ] **Int. 4 — Melendez Bustamante:** Confirmo que el frontend Socio/Entrenador puede consumir esta API sin ambigüedades

**Firmado:** _________________________ **Fecha:** _____________
