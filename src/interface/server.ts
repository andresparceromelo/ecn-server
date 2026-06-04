import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { env } from '../infrastructure/config/env';
import { logger } from '../infrastructure/logger/logger';
import { prisma } from '../infrastructure/database/prisma';
import routes from './routes/index';
import { errorHandler } from './middlewares/error-handler.middleware';

const app = express();

app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.get('/api/v1/health', (_req, res) => {
  res.json({ data: { status: 'ok', timestamp: new Date().toISOString() } });
});

app.use('/api/v1', routes);

app.use((_req, res) => {
  res.status(404).json({ error: true, message: 'Ruta no encontrada', statusCode: 404 });
});

app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Servidor iniciado');
});

process.on('SIGINT', async () => {
  logger.info('Apagando servidor...');
  server.close();
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
