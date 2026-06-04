import { type Request, type Response, type NextFunction } from 'express';
import { GetProfileUseCase } from '../../application/use-cases/athletes/get-profile.use-case';
import { CreateProfileUseCase } from '../../application/use-cases/athletes/create-profile.use-case';
import { GeneratePlanUseCase } from '../../application/use-cases/athletes/generate-plan.use-case';
import { GetAthleteStatsUseCase } from '../../application/use-cases/athletes/get-athlete-stats.use-case';
import { PrismaAthleteProfileRepository } from '../../infrastructure/repositories/prisma-athlete-profile.repository';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';
import { PrismaPerformanceLogRepository } from '../../infrastructure/repositories/prisma-performance-log.repository';
import { prisma } from '../../infrastructure/database/prisma';

const profileRepo = new PrismaAthleteProfileRepository(prisma);
const userRepo = new PrismaUserRepository(prisma);
const logRepo = new PrismaPerformanceLogRepository(prisma);
const getProfileUseCase = new GetProfileUseCase(profileRepo);
const createProfileUseCase = new CreateProfileUseCase(profileRepo);
const generatePlanUseCase = new GeneratePlanUseCase(userRepo, profileRepo);
const getAthleteStatsUseCase = new GetAthleteStatsUseCase(logRepo);

export function getProfile(req: Request, res: Response, next: NextFunction): void {
  const userId = req.user!.id;
  getProfileUseCase.execute(userId)
    .then((result) => res.status(200).json({ data: result }))
    .catch(next);
}

export function createProfile(req: Request, res: Response, next: NextFunction): void {
  const userId = req.user!.id;
  createProfileUseCase.execute(userId, req.body)
    .then((result) => res.status(201).json({ data: result }))
    .catch(next);
}

export function getPlan(req: Request, res: Response, next: NextFunction): void {
  const userId = req.user!.id;
  const { discipline } = req.query as { discipline: string };
  generatePlanUseCase.execute(userId, discipline)
    .then((result) => res.status(200).json({ data: result }))
    .catch(next);
}

export function getAthleteStats(req: Request, res: Response, next: NextFunction): void {
  const userId = req.user!.id;
  getAthleteStatsUseCase.execute(userId)
    .then((result) => res.status(200).json({ data: result }))
    .catch(next);
}
