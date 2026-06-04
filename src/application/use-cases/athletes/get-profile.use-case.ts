import { AthleteProfileRepository } from '../../../domain/interfaces/athlete-profile.repository';
import { ProfileResponseDTO } from '../../dto/athletes/profile-response.dto';
import { AthleteProfileMapper } from '../../mappers/athlete-profile.mapper';

export class GetProfileUseCase {
  constructor(private readonly profileRepo: AthleteProfileRepository) {}

  async execute(userId: string): Promise<ProfileResponseDTO> {
    const profile = await this.profileRepo.findByUserId(userId);
    return AthleteProfileMapper.toResponse(profile);
  }
}
