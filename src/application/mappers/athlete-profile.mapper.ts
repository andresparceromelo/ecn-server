import { AthleteProfile } from '../../domain/entities/athlete-profile.entity';
import { ProfileResponseDTO } from '../dto/athletes/profile-response.dto';

export class AthleteProfileMapper {
  static toResponse(profile: AthleteProfile | null): ProfileResponseDTO {
    if (!profile) {
      return ProfileMapper.empty();
    }
    return {
      id: profile.id,
      level: profile.level,
      experienceMonths: profile.experienceMonths,
      height: profile.height,
      weight: profile.weight,
      bodyFat: profile.bodyFat,
      ffmi: profile.ffmi,
      swr: profile.swr,
      squat1RM: profile.squat1RM,
      press1RM: profile.press1RM,
      deadlift1RM: profile.deadlift1RM,
      hasProfile: true,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }

  static empty(): ProfileResponseDTO {
    return {
      id: '',
      level: '',
      experienceMonths: null,
      height: null,
      weight: null,
      bodyFat: null,
      ffmi: null,
      swr: null,
      squat1RM: null,
      press1RM: null,
      deadlift1RM: null,
      hasProfile: false,
      createdAt: '',
      updatedAt: '',
    };
  }
}

class ProfileMapper {
  static empty(): ProfileResponseDTO {
    return AthleteProfileMapper.empty();
  }
}
