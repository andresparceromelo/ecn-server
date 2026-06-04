import { Discipline } from '../../../domain/enums/discipline.enum';
import { PaginatedResult } from '../../../domain/interfaces/pagination.type';
import { PerformanceLogRepository } from '../../../domain/interfaces/performance-log.repository';
import { ListLogsDTO } from '../../dto/logs/list-logs.dto';
import { LogResponseDTO } from '../../dto/logs/log-response.dto';
import { PerformanceLogMapper } from '../../mappers/performance-log.mapper';

export class ListLogsUseCase {
  constructor(private readonly logRepo: PerformanceLogRepository) {}

  async execute(dto: ListLogsDTO): Promise<PaginatedResult<LogResponseDTO>> {
    const result = await this.logRepo.findAllByAthlete(dto.athleteId, {
      discipline: dto.discipline as unknown as Discipline,
      page: dto.page,
      limit: dto.limit,
    });

    return {
      data: result.data.map(PerformanceLogMapper.toResponse),
      meta: result.meta,
    };
  }
}
