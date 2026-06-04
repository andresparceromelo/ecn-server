# PRD — Product Requirements Document

## Proyecto: ECN Server (Backend Fitness Platform)

**Versión:** 1.0.0
**Estado:** Documento de Arquitectura Base

---

## 1. Resumen Ejecutivo

Backend REST API para la plataforma **ECN**, un sistema de seguimiento de rendimiento atlético con enfoque en **weight-lifting**. Construido con Node.js + Express + TypeScript, base de datos PostgreSQL con Prisma ORM y autenticación JWT. El sistema permite a atletas registrar su perfil biométrico inicial (1RM), hacer logging de entrenamientos por disciplina y visualizar métricas de rendimiento. Los administradores tienen acceso a un dashboard global.

---

## 2. Requisitos Funcionales (Basados en el Context.md)

### RF01 — Autenticación de Usuarios (10 pts)
| ID | Endpoint | Descripción |
|---|---|---|
| RF01.1 | `POST /api/v1/auth/register` | Registrar un nuevo atleta con email, password, nombre. Retorna JWT. |
| RF01.2 | `POST /api/v1/auth/login` | Autenticar usuario con email+password. Retorna JWT + datos del usuario. |

- Passwords encriptados con **bcrypt** (salt rounds >= 10).
- JWT firmado con secreto desde variable de entorno `JWT_SECRET`.
- Tiempo de expiración configurable vía `JWT_EXPIRES_IN`.

### RF02 — Onboarding / Perfil del Atleta (18 pts)
| ID | Método | Ruta | Descripción |
|---|---|---|---|
| RF02.1 | `GET` | `/api/v1/athletes/profile` | Obtener perfil del atleta autenticado (verificar si es primera vez para onboarding) |
| RF02.2 | `POST` | `/api/v1/athletes/profile` | Crear perfil (guardar encuesta 1RM: altura, peso, squat1RM, press1RM, deadlift1RM) |

### RF03 — CRUD de Logs de Entrenamiento (18 pts)
| ID | Método | Ruta | Descripción |
|---|---|---|---|
| RF03.1 | `GET` | `/api/v1/logs?discipline=WEIGHTLIFTING&page=1&limit=10` | Listar logs del atleta autenticado (paginado + filtros) |
| RF03.2 | `POST` | `/api/v1/logs` | Crear registro de entrenamiento |
| RF03.3 | `PUT` | `/api/v1/logs/:id` | Editar registro existente |
| RF03.4 | `DELETE` | `/api/v1/logs/:id` | Eliminar registro |

### RF04 — Panel de Administración (7 pts)
| ID | Método | Ruta | Descripción |
|---|---|---|---|
| RF04.1 | `GET` | `/api/v1/admin/dashboard` | Retorna conteo global de atletas. Solo accesible para rol ADMIN. |

### RF05 — Paginación y Meta (Parte de 18 pts)
- Toda respuesta de listado usa el formato `{ data, meta }`.
- `meta` incluye: `total`, `page`, `limit` (pageSize), `totalPages`.

### RF06 — Protección de Rutas por Rol (7 pts)
- Middleware `authenticate` verifica `Authorization: Bearer <token>`.
- Middleware `authorize('ADMIN')` restringe acceso a administradores.
- Atleta sin rol ADMIN recibe **HTTP 403**.
- Token inválido/expirado recibe **HTTP 401**.

---

## 3. Requisitos No Funcionales

### RNF01 — Seguridad
- JWT con secreto en `.env`. Tokens expirados devuelven 401.
- Passwords hasheados con bcrypt. Nunca almacenados en texto plano.
- Validación estricta de todos los inputs (body, params, query) con Zod.
- Stack trace nunca expuesto al cliente.
- Captura de errores nativos de Prisma (unique constraint, foreign key, etc.).

### RNF02 — Calidad de Código
- TypeScript modo estricto (`strict: true`).
- Menos del 30% de tipos `any`.
- Clean Architecture en 4 capas (domain, application, infrastructure, interface).
- Funciones de una sola responsabilidad.
- Sin `console.log` en producción.
- Sin código muerto o imports sin usar.

### RNF03 — Base de Datos
- PostgreSQL real (prohibido datos en memoria o hardcodeados).
- Prisma ORM con migraciones versionadas.
- Tipos de datos estrictos: uuid, text, numeric, integer, timestamptz.
- Llaves foráneas entre tablas.

---

## 4. Modelo de Datos

### Tabla: `users`
| Columna | Tipo | Restricciones |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| name | text | NOT NULL |
| email | text | NOT NULL, UNIQUE |
| password | text | NOT NULL |
| role | text | NOT NULL, default 'ATHLETE' (CHECK: 'ATHLETE' \| 'ADMIN') |
| createdAt | timestamptz | NOT NULL, default now() |
| updatedAt | timestamptz | NOT NULL, auto-update |

### Tabla: `athlete_profiles` (1:1 con users)
| Columna | Tipo | Restricciones |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| userId | uuid | NOT NULL, UNIQUE, FK → users.id (ON DELETE CASCADE) |
| level | text | NOT NULL, default 'BEGINNER' (CHECK: 'BEGINNER' \| 'INTERMEDIATE' \| 'ADVANCED' \| 'ELITE') |
| experienceMonths | integer | nullable |
| height | numeric(5,2) | nullable (metros) |
| weight | numeric(5,2) | nullable (kilogramos) |
| squat1RM | numeric(6,2) | nullable |
| press1RM | numeric(6,2) | nullable |
| deadlift1RM | numeric(6,2) | nullable |
| createdAt | timestamptz | NOT NULL, default now() |
| updatedAt | timestamptz | NOT NULL, auto-update |

### Tabla: `performance_logs` (1:N con users)
| Columna | Tipo | Restricciones |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| athleteId | uuid | NOT NULL, FK → users.id (ON DELETE CASCADE) |
| discipline | text | NOT NULL (CHECK: 'WEIGHTLIFTING' \| 'RUNNING' \| 'SWIMMING' \| 'CYCLING') |
| exerciseName | text | NOT NULL |
| metricValue | numeric(8,2) | NOT NULL |
| reps | integer | NOT NULL |
| loggedAt | timestamptz | NOT NULL, default now() |
| createdAt | timestamptz | NOT NULL, default now() |
| updatedAt | timestamptz | NOT NULL, auto-update |

---

## 5. Relaciones entre Tablas

```
users (1) ────── (1) athlete_profiles
  │
  │ (1)
  │
  └───────────── (N) performance_logs
```

- `athlete_profiles.userId` → FK → `users.id` (Relación 1:1. Un usuario tiene un solo perfil)
- `performance_logs.athleteId` → FK → `users.id` (Relación 1:N. Un usuario tiene muchos logs)

---

## 6. Variables de Entorno Requeridas

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://user:password@localhost:5432/ecn_db

JWT_SECRET=super-secret-key-min-32-chars
JWT_EXPIRES_IN=24h

BCRYPT_SALT_ROUNDS=10
```
