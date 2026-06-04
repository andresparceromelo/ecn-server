import { type Request, type Response, type NextFunction } from 'express';
import { RegisterUserUseCase } from '../../application/use-cases/auth/register-user.use-case';
import { LoginUserUseCase } from '../../application/use-cases/auth/login-user.use-case';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';
import { HashService } from '../../infrastructure/services/hash.service';
import { JwtService } from '../../infrastructure/services/jwt.service';
import { prisma } from '../../infrastructure/database/prisma';

const userRepo = new PrismaUserRepository(prisma);
const hashService = new HashService();
const jwtService = new JwtService();
const registerUseCase = new RegisterUserUseCase(userRepo, hashService, jwtService);
const loginUseCase = new LoginUserUseCase(userRepo, hashService, jwtService);

export function register(req: Request, res: Response, next: NextFunction): void {
  registerUseCase.execute(req.body)
    .then((result) => res.status(201).json({ data: result }))
    .catch(next);
}

export function login(req: Request, res: Response, next: NextFunction): void {
  loginUseCase.execute(req.body)
    .then((result) => res.status(200).json({ data: result }))
    .catch(next);
}
