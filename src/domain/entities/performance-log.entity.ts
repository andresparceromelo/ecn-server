import { Discipline } from '../enums/discipline.enum';

export class PerformanceLog {
  constructor(
    public readonly id: string,
    public readonly athleteId: string,
    public discipline: Discipline,
    public exerciseName: string,
    public metricValue: number,
    public reps: number,
    public loggedAt: Date,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
