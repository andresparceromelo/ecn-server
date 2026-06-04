import { type Request, type Response, type NextFunction } from 'express';
import { JwtService } from '../../infrastructure/services/jwt.service';
import { UnauthorizedError } from '../../domain/errors/app-error';

const jwtService = new JwtService();

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Token de autenticación no provisto'));
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwtService.verify(token);
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch {
    next(new UnauthorizedError('Token inválido o expirado'));
  }
}
