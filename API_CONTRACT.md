# API Contract — ECN Server v1

**Base URL:** `/api/v1`
**Content-Type:** `application/json`
**Autenticación:** `Authorization: Bearer <token>`
**Rol por defecto:** `ATHLETE`

---

## 1. Formato de Respuestas

### Respuesta Exitosa Genérica
```json
{ "data": { ... } }
```

### Respuesta de Listado (Paginada)
```json
{
  "data": [ ... ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### Respuesta de Error
```json
{
  "error": true,
  "message": "Descripción del error en español",
  "statusCode": 400
}
```

---

## 2. Endpoints de Autenticación (Públicos)

### `POST /api/v1/auth/register`
Registrar un nuevo usuario (atleta o administrador por defecto ATHLETE).

**Body:**
```json
{
  "name": "Andrés Bedoya",
  "email": "andres@example.com",
  "password": "Str0ng!Pass123"
}
```

**Respuesta 201 Created:**
```json
{
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Andrés Bedoya",
      "email": "andres@example.com",
      "role": "ATHLETE",
      "createdAt": "2026-06-03T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Respuesta 400 (email duplicado):**
```json
{ "error": true, "message": "El email ya está registrado", "statusCode": 400 }
```

### `POST /api/v1/auth/login`
Iniciar sesión.

**Body:**
```json
{
  "email": "andres@example.com",
  "password": "Str0ng!Pass123"
}
```

**Respuesta 200 OK:**
```json
{
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Andrés Bedoya",
      "email": "andres@example.com",
      "role": "ATHLETE"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Respuesta 401 (credenciales inválidas):**
```json
{ "error": true, "message": "Credenciales inválidas", "statusCode": 401 }
```

---

## 3. Endpoints de Perfil de Atleta (Protegidos)

### `GET /api/v1/athletes/profile`
Obtener el perfil del atleta autenticado. Si no existe perfil, retorna `data: null` para detectar onboarding pendiente.

**Headers:** `Authorization: Bearer <token>`

**Respuesta 200 OK (con perfil existente):**
```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "level": "BEGINNER",
    "experienceMonths": 6,
    "height": 1.75,
    "weight": 78.5,
    "squat1RM": 120.0,
    "press1RM": 65.0,
    "deadlift1RM": 140.0,
    "hasProfile": true,
    "createdAt": "2026-06-03T12:00:00.000Z",
    "updatedAt": "2026-06-03T12:00:00.000Z"
  }
}
```

**Respuesta 200 OK (sin perfil — onboarding pendiente):**
```json
{
  "data": {
    "hasProfile": false,
    "profile": null
  }
}
```

### `POST /api/v1/athletes/profile`
Crear perfil del atleta (encuesta 1RM inicial). Solo permitido si aún no tiene perfil.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "experienceMonths": 6,
  "height": 1.75,
  "weight": 78.5,
  "squat1RM": 120.0,
  "press1RM": 65.0,
  "deadlift1RM": 140.0
}
```

**Respuesta 201 Created:**
```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "level": "BEGINNER",
    "experienceMonths": 6,
    "height": 1.75,
    "weight": 78.5,
    "squat1RM": 120.0,
    "press1RM": 65.0,
    "deadlift1RM": 140.0,
    "hasProfile": true,
    "createdAt": "2026-06-03T12:00:00.000Z",
    "updatedAt": "2026-06-03T12:00:00.000Z"
  }
}
```

**Respuesta 409 Conflict (perfil ya existe):**
```json
{ "error": true, "message": "El perfil de atleta ya existe", "statusCode": 409 }
```

**Respuesta 400 (validación Zod):**
```json
{ "error": true, "message": "squat1RM debe ser un número positivo", "statusCode": 400 }
```

---

## 4. Endpoints de Logs de Entrenamiento (Protegidos)

### `GET /api/v1/logs`
Listar logs de rendimiento del atleta autenticado. Paginación y filtros opcionales.

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| discipline | enum | No | Filtrar por disciplina (WEIGHTLIFTING, RUNNING, SWIMMING, CYCLING) |
| page | integer | No (default 1) | Número de página |
| limit | integer | No (default 10) | Registros por página |

**Respuesta 200 OK:**
```json
{
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "discipline": "WEIGHTLIFTING",
      "exerciseName": "Sentadilla",
      "metricValue": 120.0,
      "reps": 8,
      "loggedAt": "2026-06-03T14:00:00.000Z",
      "createdAt": "2026-06-03T14:00:00.000Z",
      "updatedAt": "2026-06-03T14:00:00.000Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

**Respuesta 200 OK (vacío):**
```json
{ "data": [], "meta": { "total": 0, "page": 1, "limit": 10, "totalPages": 0 } }
```

### `POST /api/v1/logs`
Crear un nuevo registro de entrenamiento.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "discipline": "WEIGHTLIFTING",
  "exerciseName": "Sentadilla",
  "metricValue": 120.0,
  "reps": 8,
  "loggedAt": "2026-06-03T14:00:00.000Z"
}
```

**Respuesta 201 Created:**
```json
{
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "discipline": "WEIGHTLIFTING",
    "exerciseName": "Sentadilla",
    "metricValue": 120.0,
    "reps": 8,
    "loggedAt": "2026-06-03T14:00:00.000Z",
    "createdAt": "2026-06-03T14:00:00.000Z",
    "updatedAt": "2026-06-03T14:00:00.000Z"
  }
}
```

**Respuesta 400 (validación):**
```json
{ "error": true, "message": "La disciplina debe ser uno de: WEIGHTLIFTING, RUNNING, SWIMMING, CYCLING", "statusCode": 400 }
```

### `PUT /api/v1/logs/:id`
Actualizar un registro existente. Solo el dueño del log puede modificarlo.

**Headers:** `Authorization: Bearer <token>`

**Body (parcial):**
```json
{
  "metricValue": 130.0,
  "reps": 6
}
```

**Respuesta 200 OK:**
```json
{
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "discipline": "WEIGHTLIFTING",
    "exerciseName": "Sentadilla",
    "metricValue": 130.0,
    "reps": 6,
    "loggedAt": "2026-06-03T14:00:00.000Z",
    "createdAt": "2026-06-03T14:00:00.000Z",
    "updatedAt": "2026-06-03T14:30:00.000Z"
  }
}
```

**Respuesta 404 (log no encontrado):**
```json
{ "error": true, "message": "Registro de entrenamiento no encontrado", "statusCode": 404 }
```

**Respuesta 403 (no es dueño del log):**
```json
{ "error": true, "message": "No tienes permiso para modificar este registro", "statusCode": 403 }
```

### `DELETE /api/v1/logs/:id`
Eliminar un registro. Solo el dueño del log puede eliminarlo.

**Headers:** `Authorization: Bearer <token>`

**Respuesta 204 No Content.**

**Respuesta 404:**
```json
{ "error": true, "message": "Registro de entrenamiento no encontrado", "statusCode": 404 }
```

---

## 5. Endpoints de Administración (Protegidos + Rol ADMIN)

### `GET /api/v1/admin/dashboard`
Obtener métricas globales del sistema. Solo accesible para usuarios con rol `ADMIN`.

**Headers:** `Authorization: Bearer <token>`

**Respuesta 200 OK:**
```json
{
  "data": {
    "totalAthletes": 42,
    "totalLogs": 380,
    "logsThisWeek": 28,
    "averageLogsPerAthlete": 9.0
  }
}
```

**Respuesta 403 (atleta sin permisos):**
```json
{ "error": true, "message": "No tienes permisos para realizar esta acción", "statusCode": 403 }
```

---

## 6. Códigos de Estado HTTP por Tipo de Error

| Situación | HTTP | Mensaje |
|---|---|---|
| Email duplicado en registro | 400 | El email ya está registrado |
| Credenciales inválidas (login) | 401 | Credenciales inválidas |
| Token no provisto | 401 | Token de autenticación no provisto |
| Token inválido/expirado | 401 | Token inválido o expirado |
| Atleta sin rol ADMIN | 403 | No tienes permisos para realizar esta acción |
| Modificar log de otro atleta | 403 | No tienes permiso para modificar este registro |
| Recurso no encontrado | 404 | [Recurso] no encontrado |
| Perfil de atleta ya existe | 409 | El perfil de atleta ya existe |
| Violación FK (usuario inexistente) | 409 | El usuario referenciado no existe |
| Error de validación (Zod) | 400 | [Mensaje descriptivo del campo inválido en español] |
| Error interno inesperado | 500 | Error interno del servidor |
