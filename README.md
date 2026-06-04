# ECN Server

Backend REST API del proyecto **ECN** — Plataforma de seguimiento de rendimiento atlético con enfoque en weight-lifting. Autenticación JWT, perfiles biométricos 1RM, logging de entrenamientos por disciplina y dashboard administrativo.

**Stack:** Node.js + Express + TypeScript + Prisma + PostgreSQL

## Deploy en Render (Blueprint)

```bash
1. Subir a GitHub: git push origin main
2. Ir a https://dashboard.render.com
3. New + Blueprint → conectar repo
4. Render crea automáticamente PostgreSQL + Web Service
5. Esperar ~3 min, abrir https://ecn-server.onrender.com/api/v1/health
```

**Admin:** `abedoya923@soyudemedellin.edu.co` / `admin123`
**Atletas demo:** `atleta01@ecn.demo` … `atleta50@ecn.demo` / `demo123`

---

## Stack Tecnológico

| Componente | Tecnología |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 4.x |
| Lenguaje | TypeScript (strict mode) |
| ORM | Prisma 5.x |
| Base de Datos | PostgreSQL 14+ |
| Validación | Zod |
| Autenticación | JWT + bcrypt |
| Logger | Pino |

---

## Requisitos Previos

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

---

## Variables de Entorno

```env
# ─── Servidor ───────────────────────────
NODE_ENV=development
PORT=3000

# ─── Base de Datos ─────────────────────
DATABASE_URL=postgresql://user:password@localhost:5432/ecn_db

# ─── JWT ────────────────────────────────
JWT_SECRET=your-super-secret-key-min-32-characters-long
JWT_EXPIRES_IN=24h

# ─── Bcrypt ─────────────────────────────
BCRYPT_SALT_ROUNDS=10
```

---

## Scripts de Ejecución

```bash
# Instalar dependencias
npm install

# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Iniciar en desarrollo (nodemon + ts-node)
npm run dev

# Compilar a JavaScript
npm run build

# Iniciar en producción
npm run start

# Linter
npm run lint

# TypeScript check (sin emitir)
npm run typecheck
```

---

## Estructura del Repositorio

```
ecn-server/
├── .env.example
├── package.json
├── tsconfig.json
├── prisma/
│   └── schema.prisma              # Modelos: User, AthleteProfile, PerformanceLog
├── src/
│   ├── domain/                    # Capa más interna
│   │   ├── entities/              # User, AthleteProfile, PerformanceLog
│   │   ├── interfaces/            # Contratos de repositorios
│   │   ├── enums/                 # UserRole, AthleteLevel, Discipline
│   │   └── errors/                # AppError y subclases
│   │
│   ├── application/               # Casos de uso
│   │   ├── use-cases/
│   │   │   ├── auth/              # RegisterUser, LoginUser
│   │   │   ├── athletes/          # GetProfile, CreateProfile
│   │   │   ├── logs/              # CRUD PerformanceLog
│   │   │   └── admin/             # GetDashboard
│   │   ├── dto/                   # DTOs de entrada/salida
│   │   └── mappers/               # Entity ↔ DTO
│   │
│   ├── infrastructure/            # Frameworks & drivers
│   │   ├── database/prisma.ts     # PrismaClient singleton
│   │   ├── repositories/          # Implementaciones Prisma
│   │   ├── services/              # JwtService, HashService
│   │   ├── config/env.ts          # Validación de .env con Zod
│   │   └── logger/logger.ts       # Logger estructurado (pino)
│   │
│   └── interface/                 # Controladores & middlewares
│       ├── controllers/           # auth, athlete, log, admin
│       ├── middlewares/           # auth, role, validation, error-handler
│       ├── routes/                # Definiciones de rutas Express
│       ├── schemas/               # Schemas Zod
│       └── server.ts              # Entry point Express
│
└── tests/                         # Pruebas (opcional)
```

---

## API Endpoints

### Autenticación (Públicos)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/auth/register` | Registrar nuevo atleta |
| POST | `/api/v1/auth/login` | Iniciar sesión |

### Perfil de Atleta (Protegidos)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/athletes/profile` | Obtener perfil propio (detección onboarding) |
| POST | `/api/v1/athletes/profile` | Crear perfil biométrico (encuesta 1RM) |
| GET | `/api/v1/athletes/plan?discipline=WEIGHTLIFTING` | Plan de entrenamiento 4 semanas (solo WEIGHTLIFTING) |

### Logs de Entrenamiento (Protegidos)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/logs` | Listar logs (paginado + filtro por disciplina) |
| POST | `/api/v1/logs` | Crear registro de entrenamiento |
| PUT | `/api/v1/logs/:id` | Actualizar registro propio |
| DELETE | `/api/v1/logs/:id` | Eliminar registro propio |

### Administración (ADMIN)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/admin/dashboard` | Dashboard global del sistema |

Todas las listas retornan `{ data, meta }` con `total`, `page`, `limit`, `totalPages`.

Ver `API_CONTRACT.md` para payloads de entrada/salida detallados.

---

## Reglas de Arquitectura (Clean Architecture)

1. **Dependencia hacia adentro:** `domain/` no conoce a `application/`. `application/` no conoce a `interface/`. `infrastructure/` implementa interfaces de `domain/`.
2. **Controladores delgados:** Extraen datos del request, llaman al caso de uso, responden.
3. **Casos de uso puros:** Sin conocimiento de HTTP. Reciben DTOs, retornan DTOs.
4. **Repositorios abstractos:** `domain/interfaces/` define el contrato; `infrastructure/repositories/` implementa con Prisma.
5. **Errores controlados:** Todos pasan por `error-handler.middleware.ts`. Stack trace nunca expuesto.

---

## Convenciones de Código

- `camelCase` para variables, funciones, métodos
- `PascalCase` para clases, interfaces, tipos, enums
- `snake_case` en base de datos (Prisma usa `@map`)
- Archivos: `kebab-case.nombre.ts`
- Sin `console.log` en producción
- Tipado estricto: evitar `any` (máx 30%)
- Zod para toda validación de entrada
- Mensajes de error en español
