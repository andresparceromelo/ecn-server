import { type Request, type Response, type NextFunction } from 'express';
import { AppError } from '../../domain/errors/app-error';
import { logger } from '../../infrastructure/logger/logger';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: true,
      message: err.message,
      statusCode: err.statusCode,
    });
    return;
  }

  logger.error({ err }, 'Error no controlado');

  res.status(500).json({
    error: true,
    message: 'Error interno del servidor',
    statusCode: 500,
  });
}
