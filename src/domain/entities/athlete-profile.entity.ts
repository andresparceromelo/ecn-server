import { AthleteLevel } from '../enums/athlete-level.enum';

export class AthleteProfile {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public level: AthleteLevel,
    public experienceMonths: number,
    public height: number,
    public weight: number,
    public bodyFat: number,
    public ffmi: number,
    public swr: number,
    public squat1RM: number,
    public press1RM: number,
    public deadlift1RM: number,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
