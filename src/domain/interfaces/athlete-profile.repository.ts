import { AthleteProfile } from '../entities/athlete-profile.entity';

export interface LevelCount {
  level: string;
  count: number;
}

export interface AthleteProfileRepository {
  findByUserId(userId: string): Promise<AthleteProfile | null>;
  save(profile: AthleteProfile): Promise<AthleteProfile>;
  update(userId: string, data: Partial<AthleteProfile>): Promise<AthleteProfile>;
  countByLevel(): Promise<LevelCount[]>;
}
