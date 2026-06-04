import { v4 as uuid } from 'uuid';
import { PerformanceLog } from '../../../domain/entities/performance-log.entity';
import { Discipline } from '../../../domain/enums/discipline.enum';
import { ValidationError } from '../../../domain/errors/app-error';
import { PerformanceLogRepository } from '../../../domain/interfaces/performance-log.repository';
import { CreateLogDTO } from '../../dto/logs/create-log.dto';
import { LogResponseDTO } from '../../dto/logs/log-response.dto';
import { PerformanceLogMapper } from '../../mappers/performance-log.mapper';

export class CreateLogUseCase {
  constructor(private readonly logRepo: PerformanceLogRepository) {}

  async execute(athleteId: string, dto: CreateLogDTO): Promise<LogResponseDTO> {
    if (!Object.values(Discipline).includes(dto.discipline as Discipline)) {
      throw new ValidationError(`La disciplina debe ser uno de: ${Object.values(Discipline).join(', ')}`);
    }

    const log = new PerformanceLog(
      uuid(),
      athleteId,
      dto.discipline as Discipline,
      dto.exerciseName,
      dto.metricValue,
      dto.reps,
      new Date(dto.loggedAt),
      new Date(),
      new Date(),
    );

    const saved = await this.logRepo.save(log);
    return PerformanceLogMapper.toResponse(saved);
  }
}
