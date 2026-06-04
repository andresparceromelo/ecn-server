import { type Request, type Response, type NextFunction } from 'express';
import { ForbiddenError } from '../../domain/errors/app-error';

export function authorize(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError());
    }
    next();
  };
}
