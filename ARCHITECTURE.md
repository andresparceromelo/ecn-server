# ARCHITECTURE.md — Clean Architecture para ECN Server (Fitness Platform)

## Principio Fundamental

**Regla de Dependencia:** Las dependencias de código fuente apuntan hacia adentro. Nada en una capa interna depende de algo en una capa externa.

```
┌─────────────────────────────────────────────┐
│               INTERFACE LAYER               │
│    (Controllers, Middlewares, Routers)      │
├─────────────────────────────────────────────┤
│              APPLICATION LAYER               │
│        (Use Cases, DTOs, Mappers)          │
├─────────────────────────────────────────────┤
│               DOMAIN LAYER                  │
│     (Entities, Repository Interfaces)       │
├─────────────────────────────────────────────┤
│             INFRASTRUCTURE LAYER             │
│   (Prisma Client, Repos Implementations)    │
└─────────────────────────────────────────────┘
```

---

## Capa 1: `src/domain/` — Capa más interna, sin dependencias externas

### Propósito
Define las reglas del negocio fitness y los contratos que las capas externas deben implementar.

### Estructura de Archivos

```
src/domain/
├── entities/
│   ├── user.entity.ts
│   ├── athlete-profile.entity.ts
│   └── performance-log.entity.ts
├── interfaces/
│   ├── user.repository.ts
│   ├── athlete-profile.repository.ts
│   └── performance-log.repository.ts
├── enums/
│   ├── user-role.enum.ts          # ATHLETE, ADMIN
│   ├── athlete-level.enum.ts      # BEGINNER, INTERMEDIATE, ADVANCED, ELITE
│   └── discipline.enum.ts         # WEIGHTLIFTING, RUNNING, SWIMMING, CYCLING
└── errors/
    └── app-error.ts
```

### Entities (Entidades)

Clases planas de TypeScript con atributos tipados estrictamente. Sin decoradores, sin lógica de infraestructura.

```typescript
// Ejemplo conceptual de User Entity
class User {
  id: string;
  name: string;
  email: string;
  password: string;   // ya hasheado con bcrypt
  role: UserRole;     // ATHLETE | ADMIN
  createdAt: Date;
  updatedAt: Date;
}

// Ejemplo conceptual de AthleteProfile Entity
class AthleteProfile {
  id: string;
  userId: string;
  level: AthleteLevel;         // BEGINNER | INTERMEDIATE | ADVANCED | ELITE
  experienceMonths: number | null;
  height: number | null;
  weight: number | null;
  squat1RM: number | null;
  press1RM: number | null;
  deadlift1RM: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// Ejemplo conceptual de PerformanceLog Entity
class PerformanceLog {
  id: string;
  athleteId: string;
  discipline: Discipline;       // WEIGHTLIFTING | RUNNING | SWIMMING | CYCLING
  exerciseName: string;
  metricValue: number;
  reps: number;
  loggedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Interfaces de Repositorio

Contratos abstractos que definen operaciones de persistencia. La capa de infraestructura los implementa.

```typescript
interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

interface AthleteProfileRepository {
  findByUserId(userId: string): Promise<AthleteProfile | null>;
  save(profile: AthleteProfile): Promise<AthleteProfile>;
  update(userId: string, data: Partial<AthleteProfile>): Promise<AthleteProfile>;
}

interface PerformanceLogRepository {
  findById(id: string): Promise<PerformanceLog | null>;
  findAllByAthlete(athleteId: string, params: LogFilterParams): Promise<PaginatedResult<PerformanceLog>>;
  save(log: PerformanceLog): Promise<PerformanceLog>;
  update(id: string, data: Partial<PerformanceLog>): Promise<PerformanceLog>;
  delete(id: string): Promise<void>;
}
```

### Errores del Dominio

Clase base `AppError` con propiedades `name`, `message`, `statusCode`. Subclases: `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ValidationError`, `ConflictError`.

---

## Capa 2: `src/application/` — Casos de Uso de la Aplicación

### Propósito
Orquestar el flujo entre la interfaz y el dominio. Contiene la lógica de aplicación: registro, login, creación de perfil, logging de rendimiento.

### Estructura de Archivos

```
src/application/
├── use-cases/
│   ├── auth/
│   │   ├── register-user.use-case.ts
│   │   └── login-user.use-case.ts
│   ├── athletes/
│   │   ├── get-profile.use-case.ts
│   │   └── create-profile.use-case.ts
│   ├── logs/
│   │   ├── create-log.use-case.ts
│   │   ├── get-log.use-case.ts
│   │   ├── list-logs.use-case.ts
│   │   ├── update-log.use-case.ts
│   │   └── delete-log.use-case.ts
│   └── admin/
│       └── get-dashboard.use-case.ts
├── dto/
│   ├── auth/
│   │   ├── register-user.dto.ts
│   │   ├── login-user.dto.ts
│   │   └── auth-response.dto.ts
│   ├── athletes/
│   │   ├── create-profile.dto.ts
│   │   ├── profile-response.dto.ts
│   │   └── profile-existing-response.dto.ts
│   ├── logs/
│   │   ├── create-log.dto.ts
│   │   ├── update-log.dto.ts
│   │   ├── log-response.dto.ts
│   │   └── list-logs.dto.ts
│   └── admin/
│       └── dashboard-response.dto.ts
└── mappers/
    ├── user.mapper.ts
    ├── athlete-profile.mapper.ts
    └── performance-log.mapper.ts
```

### Reglas de los Casos de Uso
- Cada caso de uso es una **clase con un método `execute()`**.
- Recibe dependencias por constructor (repositorios, servicios de auth, etc.).
- Retorna DTOs de salida, nunca entidades del dominio directamente.
- No sabe nada de Express, HTTP, headers, etc.

### DTOs
- Definen la forma exacta de los datos que entran y salen.
- Usan tipos planos de TypeScript (interfaces o `type`).
- No contienen lógica.

---

## Capa 3: `src/infrastructure/` — Frameworks y Drivers

### Propósito
Implementa los contratos definidos en el dominio. Contiene la configuración de Prisma, la implementación concreta de repositorios, utilidades de JWT/bcrypt y logger.

### Estructura de Archivos

```
src/infrastructure/
├── database/
│   └── prisma.ts              // Singleton de PrismaClient
├── repositories/
│   ├── prisma-user.repository.ts
│   ├── prisma-athlete-profile.repository.ts
│   └── prisma-performance-log.repository.ts
├── services/
│   ├── jwt.service.ts          // Firmar/verificar JWT
│   └── hash.service.ts         // bcrypt hash/compare
├── config/
│   └── env.ts                  // Carga y validación de .env con Zod
└── logger/
    └── logger.ts               // Logger estructurado (pino)
```

### Implementación de Repositorios

Cada repositorio concreto implementa la interfaz del dominio. Traduce entre el modelo de Prisma y la entidad del dominio.

### Configuración de Entorno

Validación estricta con Zod de todas las variables de entorno al iniciar la aplicación. Si falta una variable crítica, la app falla al arrancar.

---

## Capa 4: `src/interface/` — Controladores, Middlewares y Rutas

### Propósito
Capa más externa. Se comunica con el mundo exterior (HTTP). Traduce requests HTTP en llamadas a casos de uso y viceversa.

### Estructura de Archivos

```
src/interface/
├── controllers/
│   ├── auth.controller.ts
│   ├── athlete.controller.ts
│   ├── log.controller.ts
│   └── admin.controller.ts
├── middlewares/
│   ├── auth.middleware.ts       // Verifica JWT, asigna req.user
│   ├── role.middleware.ts       // Verifica rol ADMIN
│   ├── validation.middleware.ts // Valida body/params/query con Zod
│   └── error-handler.middleware.ts
├── routes/
│   ├── auth.routes.ts
│   ├── athlete.routes.ts
│   ├── log.routes.ts
│   ├── admin.routes.ts
│   └── index.ts                // Agrupador /api/v1
├── schemas/                     // Schemas de Zod para validación
│   ├── auth.schema.ts
│   ├── athlete.schema.ts
│   └── log.schema.ts
└── server.ts                    // Punto de entrada Express
```

### Controladores
- Son funciones middleware de Express: `(req, res, next) => void`.
- Extraen datos de `req.body`, `req.params`, `req.query`.
- Delegan en casos de uso.
- Responden con `res.status().json()`.
- Envuelven errores en `next(error)`.

### Middleware de Autenticación
- Extrae token del header `Authorization: Bearer <token>`.
- Verifica y decodifica JWT.
- Asigna `req.user = payload` al request.
- Si token falta/inválido/expirado → `next(new UnauthorizedError())`.

### Middleware de Rol
- Lee `req.user.role`.
- Si no tiene el rol requerido → `next(new ForbiddenError())`.

### Middleware de Validación
- Recibe un schema de Zod.
- Valida `body`, `params`, `query` según corresponda.
- Si falla → `next(new ValidationError(zodError))`.

### Error Handler (Único)
- Middleware de error de Express: `(err, req, res, next)`.
- Si es `AppError` → usa su `statusCode` y `message`.
- Si es error de Prisma → traduce a `AppError` (P2002 → 409 Conflict, P2025 → 404 Not Found, etc.).
- **Nunca expone `err.stack`**.
- Respuesta: `{ error: true, message: "...", statusCode: number }`.

---

## Flujo de Datos (Request → Response)

```
HTTP Request
    │
    ▼
[Router] ────▶ [Validation Middleware] ────▶ [Auth Middleware] ────▶ [Role Middleware]
                                                                          │
                                                                          ▼
                                                              [Controller]
                                                                          │
                                                                          ▼
                                                              [Use Case (Application)]
                                                                          │
                                                                          ▼
                                                              [Repository Interface (Domain)]
                                                                          │
                                                                          ▼
                                                              [Prisma Repository (Infrastructure)]
                                                                          │
                                                                          ▼
                                                              [PostgreSQL Database]
```
