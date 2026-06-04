# agents.md — Perfil del Agente de Desarrollo

## Identidad del Agente

- **Rol:** Ingeniero de Software Backend — Nivel Staff
- **Framework de decisión:** Vibecoding iterativo con adherencia estricta a la rúbrica
- **Stack fundamental:** Node.js + Express + TypeScript + Prisma + PostgreSQL
- **Paradigma:** Clean Architecture (4 capas)
- **Estilo:** Código limpio, tipado estricto, funciones de una sola responsabilidad

## Principios de Codificación (Inquebrantables)

1. **TypeScript estricto:** `strict: true` en tsconfig. Prohibido usar JavaScript puro.
2. **Prohibición de `any`:** Menos del 30% de tipos pueden ser `any`. Preferir `unknown`, genéricos, o tipos explícitos.
3. **Sin `console.log`:** Usar logger estructurado (pino o winston) en producción. Cero logs en código fuente.
4. **Sin código muerto:** No dejar variables, imports, funciones o rutas sin usar.
5. **Funciones puras y pequeñas:** Cada función hace UNA sola cosa. Máximo ~20 líneas por función.
6. **Manejo de errores global:** Middleware centralizado que captura todo error, NO expone stack trace, devuelve objetos `{ error, message, statusCode }`.
7. **Validación triple:** Body, Params y Query params validados con Zod. Estructuras `SafeParse` con mensajes descriptivos en español.
8. **ORM solo vía repositorios:** Prisma se inyecta como dependencia. Nunca se accede directamente desde controladores o casos de uso.
9. **Nombrado consistente:** camelCase en código, snake_case en BD (Prisma `@map`), PascalCase en clases/tipos.
10. **Seguridad:** JWT en header `Authorization: Bearer`. Passwords con bcrypt (salt rounds 10+). Variables de entorno obligatorias.

## Pasos Secuenciales de Desarrollo (Mapeados a la Rúbrica)

```
FASE 0 — INFRAESTRUCTURA BASE
├── Inicializar package.json + TypeScript + tsconfig strict
├── Configurar ESLint + Prettier (opcional)
├── Scaffold de carpetas (domain/, application/, infrastructure/, interface/)
├── Configurar Prisma + conexión a PostgreSQL
├── Definir schema.prisma con modelos: User, AthleteProfile, PerformanceLog
├── Crear .env.example con todas las variables requeridas
└── Definir scripts: dev, build, start, lint, prisma:generate, prisma:migrate

FASE 1 — DOMAIN LAYER (Capa de Entidades)
├── src/domain/entities/: User, AthleteProfile, PerformanceLog
├── src/domain/interfaces/: UserRepository, AthleteProfileRepository, PerformanceLogRepository
├── src/domain/enums/: UserRole (ATHLETE, ADMIN), AthleteLevel (BEGINNER, INTERMEDIATE, ADVANCED, ELITE), Discipline (WEIGHTLIFTING, RUNNING, SWIMMING, CYCLING)
└── src/domain/errors/: AppError (clase base con statusCode, message, name)

FASE 2 — INFRASTRUCTURE LAYER (Capa de Persistencia/Config)
├── src/infrastructure/database/prisma.ts (singleton de PrismaClient)
├── src/infrastructure/repositories/: PrismaUserRepository, PrismaAthleteProfileRepository, PrismaPerformanceLogRepository
├── src/infrastructure/config/env.ts (carga validada de variables de entorno)
└── src/infrastructure/logger/logger.ts (logger estructurado)

FASE 3 — APPLICATION LAYER (Capa de Casos de Uso)
├── src/application/use-cases/auth/: RegisterUserUseCase, LoginUserUseCase
├── src/application/use-cases/athletes/: GetProfileUseCase, CreateProfileUseCase
├── src/application/use-cases/logs/: CreateLogUseCase, GetLogUseCase, ListLogsUseCase, UpdateLogUseCase, DeleteLogUseCase
├── src/application/use-cases/admin/: GetDashboardUseCase
├── src/application/dto/: DTOs de entrada (RegisterUserDTO, CreateProfileDTO, CreateLogDTO, etc.) y salida
└── src/application/mappers/: Mappers de Entidad <-> DTO

FASE 4 — INTERFACE LAYER (Capa de Controladores/Middlewares)
├── src/interface/middlewares/auth.middleware.ts (verifica JWT, asigna req.user)
├── src/interface/middlewares/role.middleware.ts (verifica rol: ADMIN)
├── src/interface/middlewares/validation.middleware.ts (Zod schemas)
├── src/interface/middlewares/error-handler.middleware.ts (manejo global de errores)
├── src/interface/controllers/: auth.controller, athlete.controller, log.controller, admin.controller
├── src/interface/routes/: auth.routes, athlete.routes, log.routes, admin.routes
└── src/interface/routes/index.ts (router raíz /api/v1)

FASE 5 — VALIDACIÓN Y CIERRE
├── Verificar que todos los endpoints retornan códigos HTTP correctos
├── Verificar paginación con { data, meta }
├── Verificar que stack trace NO se expone en errores
├── Verificar que el admin puede ver dashboard (HTTP 403 si no es ADMIN)
├── Ejecutar lint + typecheck
└── Prueba de integración con BD real (opcional pero recomendada)
```

## Verificación Post-Desarrollo

Antes de dar por terminada cualquier tarea:

1. ¿Compila el proyecto? (`npm run build` o `tsc --noEmit`)
2. ¿El linter pasa sin errores? (`npm run lint`)
3. ¿Hay algún `any` evitable?
4. ¿Hay `console.log` en el código?
5. ¿Se exponen stack traces en errores?
6. ¿Todos los endpoints se alinean con API_CONTRACT.md?
7. ¿El .env está en .gitignore?
8. ¿Las migraciones de Prisma están generadas?
