import { z } from 'zod';

const disciplineEnum = z.enum(['WEIGHTLIFTING', 'RUNNING', 'SWIMMING', 'CYCLING'], {
  error: 'La disciplina debe ser uno de: WEIGHTLIFTING, RUNNING, SWIMMING, CYCLING',
});

export const planQuerySchema = z.object({
  discipline: disciplineEnum.default('WEIGHTLIFTING'),
});
