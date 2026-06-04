import { type Request, type Response, type NextFunction } from 'express';
import { GetDashboardUseCase } from '../../application/use-cases/admin/get-dashboard.use-case';
import { GetChartsUseCase } from '../../application/use-cases/admin/get-charts.use-case';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';
import { PrismaPerformanceLogRepository } from '../../infrastructure/repositories/prisma-performance-log.repository';
import { PrismaAthleteProfileRepository } from '../../infrastructure/repositories/prisma-athlete-profile.repository';
import { prisma } from '../../infrastructure/database/prisma';

const userRepo = new PrismaUserRepository(prisma);
const logRepo = new PrismaPerformanceLogRepository(prisma);
const profileRepo = new PrismaAthleteProfileRepository(prisma);
const dashboardUseCase = new GetDashboardUseCase(userRepo, logRepo);
const chartsUseCase = new GetChartsUseCase(logRepo, profileRepo, userRepo);

export function getDashboard(_req: Request, res: Response, next: NextFunction): void {
  dashboardUseCase.execute()
    .then((result) => res.status(200).json({ data: result }))
    .catch(next);
}

export function getCharts(_req: Request, res: Response, next: NextFunction): void {
  chartsUseCase.execute()
    .then((result) => res.status(200).json({ data: result }))
    .catch(next);
}
