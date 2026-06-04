import { PerformanceLogRepository } from '../../../domain/interfaces/performance-log.repository';
import { AthleteProfileRepository } from '../../../domain/interfaces/athlete-profile.repository';
import { UserRepository } from '../../../domain/interfaces/user.repository';
import { ChartsResponseDTO } from '../../dto/admin/charts-response.dto';

export class GetChartsUseCase {
  constructor(
    private readonly logRepo: PerformanceLogRepository,
    private readonly profileRepo: AthleteProfileRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async execute(): Promise<ChartsResponseDTO> {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const [logsByDiscipline, logsByMonth, athletesByLevel, usersByRole] = await Promise.all([
      this.logRepo.countByDiscipline(),
      this.logRepo.countByMonth(twelveMonthsAgo),
      this.profileRepo.countByLevel(),
      this.userRepo.countByRole(),
    ]);

    return { logsByDiscipline, logsByMonth, athletesByLevel, usersByRole };
  }
}
