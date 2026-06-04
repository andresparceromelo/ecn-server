# 🎯 ECN SYSTEM CONTEXT - PROYECTO DE AULA (25%)
**Fecha de Entrega/Sustentación:** Jueves 4 de junio de 2026, 16:00-20:00 (UdeM)
**Modalidad:** Individual (Estudiante: Andrés Bedoya Cano)
**Enfoque de Desarrollo:** Birepo (Repositorios independientes en GitHub)

---

## 💡 PREMISA DEL NEGOCIO & DOMINIO
"No existen rutinas mágicas, la personalización es análisis en el tiempo. Se implementa una rutina basada en ciencia que funciona para la mayoría de la población y a partir de ahí se ajusta según el rendimiento del atleta en el tiempo."

**Alcance del MVP (Mañana 4 de Junio):** 
Arquitectura preparada para múltiples disciplinas (Running, Swimming, Cycling), pero el **foco fundamental y core interactivo para la sustentación es WEIGHT-LIFTING**.

---

## 🛡️ REGLAS TÉCNICAS RESTRICCIONES ABSOLUTAS (RÚBRICA DE EVALUACIÓN)
Para asegurar el puntaje máximo (100/100) y evitar penalizaciones destructivas, el sistema debe cumplir rigurosamente con:

1. **Lenguaje Obligatorio:** TypeScript estricto en Backend y Frontend. 
   - *Penalización:* -15 pts por usar JS puro. -5 pts si el uso de `any` supera el 30% de los tipos.
2. **Seguridad de Credenciales:** Prohibido commitear archivos `.env` con valores reales. Usar `.env.example` en el Backend.
   - *Penalización:* -10 pts por credenciales expuestas.
3. **Persistencia Real:** Conexión real a base de datos. Prohibido usar datos en memoria.
   - *Penalización:* -15 pts.
4. **Consumo de API:** El Frontend debe consumir exclusivamente la API propia, no APIs externas.
   - *Penalización:* -20 pts.
5. **Calidad de Código:** Sin `console.log` olvidados, sin código muerto, funciones con una sola responsabilidad (atómicas) y formato uniforme.

---

## 🏗️ ARQUITECTURA GENERAL DEL BIREPO

### 1. BACKEND (`ecn-backend`)
- **Stack:** Node.js + Express + TypeScript + PostgreSQL + Prisma ORM.
- **Tecnologías Prohibidas:** MongoDB, Sequelize.
- **Estructura (Clean Architecture - 4 Capas):**
  - `domain/`: Entidades del negocio e interfaces de repositorios.
  - `application/`: Casos de uso y Data Transfer Objects (DTOs).
  - `infrastructure/`: Clientes de Base de Datos (Prisma), utilidades de hash (bcrypt) y JWT.
  - `interface/`: Controladores Express, Middlewares (Auth por JWT, Roles, Validaciones Zod/Joi) y Rutas.

### 2. FRONTEND (`ecn-frontend`)
- **Stack:** React + Vite + TypeScript + Axios (Cliente centralizado con interceptores para inyectar token JWT).
- **Tecnologías Prohibidas:** Next.js, Redux.
- **Estructura (Estructura Modular):**
  - `services/`: Capa de servicios Axios centralizada para consumo de API y captura global de errores.
  - `hooks/`: Custom hooks para aislar la lógica de estado y peticiones de la UI.
  - `components/`: Componentes atómicos visuales 100% reutilizables (deben manejar estados de Loading, Vacío y Error).
  - `pages/`: Vistas de la aplicación (Login/Registro, Dashboard, Formulario Crear/Editar, Vista Admin/Detalle).
  - `types/`: Definición estricta de interfaces TypeScript.

---

## 🗂️ MODELO DE DATOS (ENTIDADES CORE)

1. **User (Usuario/Autenticación):** `id` (UUID), `email` (Unique), `password` (Bcrypt hash), `role` (Enum: ATHLETE, ADMIN), `createdAt`, `updatedAt`.
2. **AthleteProfile (Onboarding 1:1 con User):** `id` (UUID), `userId` (FK), `level` (Enum: BEGINNER, INTERMEDIATE, ADVANCED, ELITE), `experienceMonths`, `height` (Numeric), `weight` (Numeric), `squat1RM` (Numeric), `press1RM` (Numeric), `deadlift1RM` (Numeric).
3. **PerformanceLog (Métricas/Historial 1:N con User):** `id` (UUID), `athleteId` (FK), `discipline` (Enum: WEIGHTLIFTING, RUNNING, SWIMMING, CYCLING), `exerciseName` (String), `metricValue` (Numeric), `reps` (Integer), `loggedAt` (Timestamptz).

---

## 🔌 CONTRATO DE INTERFACES API REST (`/api/v1`)

- **Públicas:**
  - `POST /api/v1/auth/register` -> Registro. Retorna JWT.
  - `POST /api/v1/auth/login` -> Login. Retorna JWT + Data de usuario.
- **Protegidas (JWT Bearer):**
  - `GET /api/v1/athletes/profile` -> Obtener perfil (Verificar si es primera vez para onboarding).
  - `POST /api/v1/athletes/profile` -> Crear perfil (Guardar encuesta 1RM).
  - `GET /api/v1/logs?discipline=WEIGHTLIFTING&page=1&limit=10` -> Paginación obligatoria `{ data, meta }` con filtros.
  - `POST /api/v1/logs` -> Crear registro de entrenamiento (Valida campos obligatorios y tipos).
  - `PUT /api/v1/logs/:id` -> Editar registro.
  - `DELETE /api/v1/logs/:id` -> Eliminar registro.
- **Protegidas (JWT + Rol ADMIN):**
  - `GET /api/v1/admin/dashboard` -> Retorna conteo de atletas globales. Bloquea atletas con HTTP 403.

---

## 🚀 FLUJO DE EJECUCIÓN DEL SISTEMA (FRONTEND)
1. **Flujo de Acceso:** Login / Registro funcional. Errores del Backend renderizados junto al campo (Prohibido usar `alert()`).
2. **Onboarding Check:** ¿Primera vez? -> Redirige a Formulario/Encuesta (Cálculo inicial de nivel basado en 1RM de Sentadilla, Press plano e Inclinado, Peso Muerto, altura, peso).
3. **Dashboard Principal:** Si ya tiene perfil, carga métricas de mejora en el tiempo (gráficas/listados avanzados) y navegación lateral a disciplinas.
4. **Protección:** Rutas privadas redirigen a `/login` si no hay sesión. Si la sesión expira (HTTP 401 de la API), el cliente Axios intercepta y redirige automáticamente al Login.

---

## 🛠️ PRÓXIMO PASO INMEDIATO: FASE 1
Cualquier IA que lea este archivo debe dar por sentado que el contexto de negocio, técnico y de rúbrica ha sido asimilado por completo. Proceder directamente al **Diseño de la Base de Datos (`schema.prisma`)** asegurando las restricciones de tipos y relaciones especificadas.