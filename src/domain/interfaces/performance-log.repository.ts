import { PerformanceLog } from '../entities/performance-log.entity';
import { Discipline } from '../enums/discipline.enum';
import { PaginatedResult } from './pagination.type';

export interface LogFilterParams {
  discipline?: Discipline;
  page?: number;
  limit?: number;
}

export interface DisciplineCount {
  discipline: string;
  count: number;
}

export interface MonthlyCount {
  month: string;
  count: number;
}

export interface PerformanceLogRepository {
  findById(id: string): Promise<PerformanceLog | null>;
  findAllByAthlete(athleteId: string, params: LogFilterParams): Promise<PaginatedResult<PerformanceLog>>;
  save(log: PerformanceLog): Promise<PerformanceLog>;
  update(id: string, data: Partial<PerformanceLog>): Promise<PerformanceLog>;
  delete(id: string): Promise<void>;
  countAll(): Promise<number>;
  countSince(date: Date): Promise<number>;
  countByDiscipline(): Promise<DisciplineCount[]>;
  countByMonth(since: Date): Promise<MonthlyCount[]>;
  countByDisciplineForAthlete(athleteId: string): Promise<DisciplineCount[]>;
  countByMonthForAthlete(athleteId: string, since: Date): Promise<MonthlyCount[]>;
}
