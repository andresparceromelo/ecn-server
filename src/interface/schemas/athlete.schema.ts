import { z } from 'zod';

export const createProfileSchema = z.object({
  experienceMonths: z.number().int().nonnegative('Los meses de experiencia deben ser un número positivo'),
  height: z.number().positive('La altura debe ser un número positivo').min(100, 'La altura mínima es 100 cm').max(250, 'La altura máxima es 250 cm'),
  weight: z.number().positive('El peso debe ser un número positivo').max(500, 'El peso máximo es 500 kg'),
  bodyFat: z.number().positive('El porcentaje de grasa debe ser positivo').max(100, 'El porcentaje máximo es 100').optional(),
  squat1RM: z.number().positive('squat1RM debe ser un número positivo'),
  press1RM: z.number().positive('press1RM debe ser un número positivo'),
  deadlift1RM: z.number().positive('deadlift1RM debe ser un número positivo'),
});
