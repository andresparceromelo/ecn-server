import { Discipline } from '../../../domain/enums/discipline.enum';
import { ForbiddenError, NotFoundError } from '../../../domain/errors/app-error';
import { PerformanceLogRepository } from '../../../domain/interfaces/performance-log.repository';
import { UpdateLogDTO } from '../../dto/logs/update-log.dto';
import { LogResponseDTO } from '../../dto/logs/log-response.dto';
import { PerformanceLogMapper } from '../../mappers/performance-log.mapper';

export class UpdateLogUseCase {
  constructor(private readonly logRepo: PerformanceLogRepository) {}

  async execute(id: string, athleteId: string, dto: UpdateLogDTO): Promise<LogResponseDTO> {
    const existing = await this.logRepo.findById(id);
    if (!existing) {
      throw new NotFoundError('Registro de entrenamiento');
    }
    if (existing.athleteId !== athleteId) {
      throw new ForbiddenError('No tienes permiso para modificar este registro');
    }

    const updated = await this.logRepo.update(id, {
      discipline: dto.discipline as unknown as Discipline,
      exerciseName: dto.exerciseName,
      metricValue: dto.metricValue,
      reps: dto.reps,
      loggedAt: dto.loggedAt ? new Date(dto.loggedAt) : undefined,
    });

    return PerformanceLogMapper.toResponse(updated);
  }
}
