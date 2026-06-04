import { UserRepository } from '../../../domain/interfaces/user.repository';

export class UploadAvatarUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(userId: string, filename: string): Promise<string> {
    const avatarUrl = `/uploads/avatars/${filename}`;
    await this.userRepo.updateAvatar(userId, avatarUrl);
    return avatarUrl;
  }
}
