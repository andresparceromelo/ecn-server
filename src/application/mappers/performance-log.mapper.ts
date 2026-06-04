import { PerformanceLog } from '../../domain/entities/performance-log.entity';
import { LogResponseDTO } from '../dto/logs/log-response.dto';

export class PerformanceLogMapper {
  static toResponse(log: PerformanceLog): LogResponseDTO {
    return {
      id: log.id,
      discipline: log.discipline,
      exerciseName: log.exerciseName,
      metricValue: log.metricValue,
      reps: log.reps,
      loggedAt: log.loggedAt.toISOString(),
      createdAt: log.createdAt.toISOString(),
      updatedAt: log.updatedAt.toISOString(),
    };
  }
}
