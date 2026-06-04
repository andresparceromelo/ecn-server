import { z } from 'zod';

const disciplineEnum = z.enum(['WEIGHTLIFTING', 'RUNNING', 'SWIMMING', 'CYCLING'], {
  error: 'La disciplina debe ser uno de: WEIGHTLIFTING, RUNNING, SWIMMING, CYCLING',
});

export const createLogSchema = z.object({
  discipline: disciplineEnum,
  exerciseName: z.string().min(1, 'El nombre del ejercicio es requerido').max(200, 'El nombre del ejercicio no puede exceder 200 caracteres'),
  metricValue: z.number().positive('metricValue debe ser un número positivo'),
  reps: z.number().int().positive('reps debe ser un número entero positivo'),
  loggedAt: z.string().datetime('loggedAt debe ser una fecha ISO válida'),
});

export const updateLogSchema = z.object({
  discipline: disciplineEnum.optional(),
  exerciseName: z.string().min(1, 'El nombre del ejercicio es requerido').max(200).optional(),
  metricValue: z.number().positive('metricValue debe ser un número positivo').optional(),
  reps: z.number().int().positive('reps debe ser un número entero positivo').optional(),
  loggedAt: z.string().datetime('loggedAt debe ser una fecha ISO válida').optional(),
});

export const listLogsSchema = z.object({
  discipline: disciplineEnum.optional(),
  page: z.coerce.number().int().positive('page debe ser un número positivo').default(1),
  limit: z.coerce.number().int().positive('limit debe ser un número positivo').max(100).default(10),
});

export const idParamSchema = z.object({
  id: z.string().uuid('El ID debe ser un UUID válido'),
});
