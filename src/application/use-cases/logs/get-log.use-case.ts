import { ForbiddenError, NotFoundError } from '../../../domain/errors/app-error';
import { PerformanceLogRepository } from '../../../domain/interfaces/performance-log.repository';
import { LogResponseDTO } from '../../dto/logs/log-response.dto';
import { PerformanceLogMapper } from '../../mappers/performance-log.mapper';

export class GetLogUseCase {
  constructor(private readonly logRepo: PerformanceLogRepository) {}

  async execute(id: string, athleteId: string): Promise<LogResponseDTO> {
    const log = await this.logRepo.findById(id);
    if (!log) {
      throw new NotFoundError('Registro de entrenamiento');
    }
    if (log.athleteId !== athleteId) {
      throw new ForbiddenError('No tienes permiso para acceder a este registro');
    }
    return PerformanceLogMapper.toResponse(log);
  }
}
