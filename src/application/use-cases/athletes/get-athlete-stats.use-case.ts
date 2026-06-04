import { PerformanceLogRepository } from '../../../domain/interfaces/performance-log.repository';
import { AthleteStatsResponseDTO } from '../../dto/athletes/athlete-stats-response.dto';

export class GetAthleteStatsUseCase {
  constructor(
    private readonly logRepo: PerformanceLogRepository,
  ) {}

  async execute(athleteId: string): Promise<AthleteStatsResponseDTO> {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const [logsByMonth, logsByDiscipline] = await Promise.all([
      this.logRepo.countByMonthForAthlete(athleteId, twelveMonthsAgo),
      this.logRepo.countByDisciplineForAthlete(athleteId),
    ]);

    const totalLogs = logsByDiscipline.reduce((sum, d) => sum + d.count, 0);

    return { logsByMonth, logsByDiscipline, totalLogs };
  }
}
