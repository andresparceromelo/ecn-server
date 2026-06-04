import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  DATABASE_URL: z.string().url().min(1, 'DATABASE_URL es requerida'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(1).max(20).default(10),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  process.stderr.write('❌ Variables de entorno inválidas:\n');
  for (const issue of parsed.error.issues) {
    process.stderr.write(`  - ${issue.path.join('.')}: ${issue.message}\n`);
  }
  process.exit(1);
}

export const env = parsed.data;
