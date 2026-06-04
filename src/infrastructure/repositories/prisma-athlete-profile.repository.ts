import { PrismaClient, AthleteProfile as PrismaAthleteProfileModel } from '@prisma/client';
import { AthleteProfile } from '../../domain/entities/athlete-profile.entity';
import { AthleteLevel } from '../../domain/enums/athlete-level.enum';
import { AthleteProfileRepository, LevelCount } from '../../domain/interfaces/athlete-profile.repository';

export class PrismaAthleteProfileRepository implements AthleteProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserId(userId: string): Promise<AthleteProfile | null> {
    const profile = await this.prisma.athleteProfile.findUnique({ where: { userId } });
    return profile ? this.toDomain(profile) : null;
  }

  async save(profile: AthleteProfile): Promise<AthleteProfile> {
    const created = await this.prisma.athleteProfile.create({
      data: {
        id: profile.id,
        userId: profile.userId,
        level: profile.level as unknown as PrismaAthleteProfileModel['level'],
        experienceMonths: profile.experienceMonths,
        height: profile.height,
        weight: profile.weight,
        bodyFat: profile.bodyFat,
        ffmi: profile.ffmi,
        swr: profile.swr,
        squat1RM: profile.squat1RM,
        press1RM: profile.press1RM,
        deadlift1RM: profile.deadlift1RM,
      },
    });
    return this.toDomain(created);
  }

  async update(userId: string, data: Partial<AthleteProfile>): Promise<AthleteProfile> {
    const updated = await this.prisma.athleteProfile.update({
      where: { userId },
      data: {
        level: data.level as unknown as PrismaAthleteProfileModel['level'],
        experienceMonths: data.experienceMonths,
        height: data.height,
        weight: data.weight,
        bodyFat: data.bodyFat,
        ffmi: data.ffmi,
        swr: data.swr,
        squat1RM: data.squat1RM,
        press1RM: data.press1RM,
        deadlift1RM: data.deadlift1RM,
      },
    });
    return this.toDomain(updated);
  }

  async countByLevel(): Promise<LevelCount[]> {
    const result = await this.prisma.athleteProfile.groupBy({
      by: ['level'],
      _count: { id: true },
    });
    return result.map((r) => ({ level: r.level as unknown as string, count: r._count.id }));
  }

  private toDomain(profile: PrismaAthleteProfileModel): AthleteProfile {
    return new AthleteProfile(
      profile.id,
      profile.userId,
      profile.level as unknown as AthleteLevel,
      profile.experienceMonths,
      Number(profile.height),
      Number(profile.weight),
      Number(profile.bodyFat),
      Number(profile.ffmi),
      Number(profile.swr),
      Number(profile.squat1RM),
      Number(profile.press1RM),
      Number(profile.deadlift1RM),
      profile.createdAt,
      profile.updatedAt,
    );
  }
}
