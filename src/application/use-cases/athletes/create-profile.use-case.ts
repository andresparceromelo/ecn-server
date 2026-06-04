import { v4 as uuid } from 'uuid';
import { AthleteProfile } from '../../../domain/entities/athlete-profile.entity';
import { ConflictError } from '../../../domain/errors/app-error';
import { AthleteProfileRepository } from '../../../domain/interfaces/athlete-profile.repository';
import { CreateProfileDTO } from '../../dto/athletes/create-profile.dto';
import { ProfileResponseDTO } from '../../dto/athletes/profile-response.dto';
import { AthleteProfileMapper } from '../../mappers/athlete-profile.mapper';
import { calculateAthleteStatus } from '../../../domain/services/athlete-calculator.service';

export class CreateProfileUseCase {
  constructor(private readonly profileRepo: AthleteProfileRepository) {}

  async execute(userId: string, dto: CreateProfileDTO): Promise<ProfileResponseDTO> {
    const existing = await this.profileRepo.findByUserId(userId);
    if (existing) {
      throw new ConflictError('El perfil de atleta ya existe');
    }

    const stats = calculateAthleteStatus({
      experienceMonths: dto.experienceMonths!,
      heightCm: dto.height!, // Already in cm — calculator divides by 100 internally
      weightKg: dto.weight!,
      bodyFatPercentage: dto.bodyFat,
      squat1RM: dto.squat1RM!,
      press1RM: dto.press1RM!,
      deadlift1RM: dto.deadlift1RM!
    });

    const profile = new AthleteProfile(
      uuid(),
      userId,
      stats.level,
      dto.experienceMonths!,
      dto.height!,
      dto.weight!,
      stats.bodyFat,
      stats.ffmi,
      stats.swr,
      dto.squat1RM!,
      dto.press1RM!,
      dto.deadlift1RM!,
      new Date(),
      new Date(),
    );

    const saved = await this.profileRepo.save(profile);
    return AthleteProfileMapper.toResponse(saved);
  }
}
