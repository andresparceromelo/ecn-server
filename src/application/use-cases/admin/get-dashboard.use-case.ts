import { PerformanceLogRepository } from '../../../domain/interfaces/performance-log.repository';
import { UserRepository } from '../../../domain/interfaces/user.repository';
import { DashboardResponseDTO } from '../../dto/admin/dashboard-response.dto';

export class GetDashboardUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly logRepo: PerformanceLogRepository,
  ) {}

  async execute(): Promise<DashboardResponseDTO> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [totalAthletes, totalLogs, logsThisWeek] = await Promise.all([
      this.userRepo.countAll(),
      this.logRepo.countAll(),
      this.logRepo.countSince(oneWeekAgo),
    ]);

    return {
      totalAthletes,
      totalLogs,
      logsThisWeek,
      averageLogsPerAthlete: totalAthletes > 0
        ? Math.round((totalLogs / totalAthletes) * 10) / 10
        : 0,
    };
  }
}
