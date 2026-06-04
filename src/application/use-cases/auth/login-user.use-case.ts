import { UnauthorizedError } from '../../../domain/errors/app-error';
import { UserRepository } from '../../../domain/interfaces/user.repository';
import { HashService } from '../../../infrastructure/services/hash.service';
import { JwtService } from '../../../infrastructure/services/jwt.service';
import { LoginUserDTO } from '../../dto/auth/login-user.dto';
import { AuthResponseDTO } from '../../dto/auth/auth-response.dto';
import { UserMapper } from '../../mappers/user.mapper';

export class LoginUserUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginUserDTO): Promise<AuthResponseDTO> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const isValid = await this.hashService.compare(dto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const token = this.jwtService.sign({ id: user.id, email: user.email, role: user.role });
    return UserMapper.toAuthResponse(user, token);
  }
}
