import { PrismaClient, PerformanceLog as PrismaPerformanceLogModel, Prisma } from '@prisma/client';
import { PerformanceLog } from '../../domain/entities/performance-log.entity';
import { Discipline } from '../../domain/enums/discipline.enum';
import { LogFilterParams, PerformanceLogRepository, DisciplineCount, MonthlyCount } from '../../domain/interfaces/performance-log.repository';
import { PaginatedResult } from '../../domain/interfaces/pagination.type';

export class PrismaPerformanceLogRepository implements PerformanceLogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<PerformanceLog | null> {
    const log = await this.prisma.performanceLog.findUnique({ where: { id } });
    return log ? this.toDomain(log) : null;
  }

  async findAllByAthlete(athleteId: string, params: LogFilterParams): Promise<PaginatedResult<PerformanceLog>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.PerformanceLogWhereInput = { athleteId };

    if (params.discipline) {
      where.discipline = params.discipline as unknown as PrismaPerformanceLogModel['discipline'];
    }

    const [data, total] = await Promise.all([
      this.prisma.performanceLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { loggedAt: 'desc' },
      }),
      this.prisma.performanceLog.count({ where }),
    ]);

    return {
      data: data.map((log) => this.toDomain(log)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async save(log: PerformanceLog): Promise<PerformanceLog> {
    const created = await this.prisma.performanceLog.create({
      data: {
        id: log.id,
        athleteId: log.athleteId,
        discipline: log.discipline as unknown as PrismaPerformanceLogModel['discipline'],
        exerciseName: log.exerciseName,
        metricValue: log.metricValue,
        reps: log.reps,
        loggedAt: log.loggedAt,
      },
    });
    return this.toDomain(created);
  }

  async update(id: string, data: Partial<PerformanceLog>): Promise<PerformanceLog> {
    const updated = await this.prisma.performanceLog.update({
      where: { id },
      data: {
        discipline: data.discipline as unknown as PrismaPerformanceLogModel['discipline'],
        exerciseName: data.exerciseName,
        metricValue: data.metricValue,
        reps: data.reps,
        loggedAt: data.loggedAt,
      },
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.performanceLog.delete({ where: { id } });
  }

  async countAll(): Promise<number> {
    return this.prisma.performanceLog.count();
  }

  async countSince(date: Date): Promise<number> {
    return this.prisma.performanceLog.count({ where: { createdAt: { gte: date } } });
  }

  async countByDiscipline(): Promise<DisciplineCount[]> {
    const result = await this.prisma.performanceLog.groupBy({
      by: ['discipline'],
      _count: { id: true },
    });
    return result.map((r) => ({ discipline: r.discipline as unknown as string, count: r._count.id }));
  }

  async countByMonth(since: Date): Promise<MonthlyCount[]> {
    const logs = await this.prisma.performanceLog.findMany({
      where: { loggedAt: { gte: since } },
      select: { loggedAt: true },
      orderBy: { loggedAt: 'asc' },
    });
    const map = new Map<string, number>();
    for (const log of logs) {
      const key = `${log.loggedAt.getFullYear()}-${String(log.loggedAt.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([month, count]) => ({ month, count }));
  }

  async countByDisciplineForAthlete(athleteId: string): Promise<DisciplineCount[]> {
    const result = await this.prisma.performanceLog.groupBy({
      by: ['discipline'],
      where: { athleteId },
      _count: { id: true },
    });
    return result.map((r) => ({ discipline: r.discipline as unknown as string, count: r._count.id }));
  }

  async countByMonthForAthlete(athleteId: string, since: Date): Promise<MonthlyCount[]> {
    const logs = await this.prisma.performanceLog.findMany({
      where: { athleteId, loggedAt: { gte: since } },
      select: { loggedAt: true },
      orderBy: { loggedAt: 'asc' },
    });
    const map = new Map<string, number>();
    for (const log of logs) {
      const key = `${log.loggedAt.getFullYear()}-${String(log.loggedAt.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([month, count]) => ({ month, count }));
  }

  private toDomain(log: PrismaPerformanceLogModel): PerformanceLog {
    return new PerformanceLog(
      log.id,
      log.athleteId,
      log.discipline as unknown as Discipline,
      log.exerciseName,
      Number(log.metricValue),
      log.reps,
      log.loggedAt,
      log.createdAt,
      log.updatedAt,
    );
  }
}
