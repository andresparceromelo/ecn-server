import { User } from '../../domain/entities/user.entity';
import { AuthUserDTO, AuthResponseDTO } from '../dto/auth/auth-response.dto';

export class UserMapper {
  static toAuthResponse(user: User, token: string): AuthResponseDTO {
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  static toAuthUserDTO(user: User): AuthUserDTO {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
