import { type Request, type Response, type NextFunction } from 'express';
import { CreateLogUseCase } from '../../application/use-cases/logs/create-log.use-case';
import { GetLogUseCase } from '../../application/use-cases/logs/get-log.use-case';
import { ListLogsUseCase } from '../../application/use-cases/logs/list-logs.use-case';
import { UpdateLogUseCase } from '../../application/use-cases/logs/update-log.use-case';
import { DeleteLogUseCase } from '../../application/use-cases/logs/delete-log.use-case';
import { PrismaPerformanceLogRepository } from '../../infrastructure/repositories/prisma-performance-log.repository';
import { prisma } from '../../infrastructure/database/prisma';

const logRepo = new PrismaPerformanceLogRepository(prisma);
const createLogUseCase = new CreateLogUseCase(logRepo);
const getLogUseCase = new GetLogUseCase(logRepo);
const listLogsUseCase = new ListLogsUseCase(logRepo);
const updateLogUseCase = new UpdateLogUseCase(logRepo);
const deleteLogUseCase = new DeleteLogUseCase(logRepo);

export function createLog(req: Request, res: Response, next: NextFunction): void {
  const athleteId = req.user!.id;
  createLogUseCase.execute(athleteId, req.body)
    .then((result) => res.status(201).json({ data: result }))
    .catch(next);
}

export function getLog(req: Request, res: Response, next: NextFunction): void {
  const athleteId = req.user!.id;
  const id = String(req.params.id);
  getLogUseCase.execute(id, athleteId)
    .then((result) => res.status(200).json({ data: result }))
    .catch(next);
}

export function listLogs(req: Request, res: Response, next: NextFunction): void {
  const athleteId = req.user!.id;
  const discipline = req.query.discipline ? String(req.query.discipline) : undefined;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  listLogsUseCase.execute({ athleteId, discipline, page, limit })
    .then((result) => res.status(200).json(result))
    .catch(next);
}

export function updateLog(req: Request, res: Response, next: NextFunction): void {
  const athleteId = req.user!.id;
  const id = String(req.params.id);
  updateLogUseCase.execute(id, athleteId, req.body)
    .then((result) => res.status(200).json({ data: result }))
    .catch(next);
}

export function deleteLog(req: Request, res: Response, next: NextFunction): void {
  const athleteId = req.user!.id;
  const id = String(req.params.id);
  deleteLogUseCase.execute(id, athleteId)
    .then(() => res.status(204).send())
    .catch(next);
}
