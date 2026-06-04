import { v4 as uuid } from 'uuid';
import { User } from '../../../domain/entities/user.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { ConflictError } from '../../../domain/errors/app-error';
import { UserRepository } from '../../../domain/interfaces/user.repository';
import { HashService } from '../../../infrastructure/services/hash.service';
import { JwtService } from '../../../infrastructure/services/jwt.service';
import { RegisterUserDTO } from '../../dto/auth/register-user.dto';
import { AuthResponseDTO } from '../../dto/auth/auth-response.dto';
import { UserMapper } from '../../mappers/user.mapper';

export class RegisterUserUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: RegisterUserDTO): Promise<AuthResponseDTO> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError('El email ya está registrado');
    }

    const hashedPassword = await this.hashService.hash(dto.password);

    const user = new User(uuid(), dto.name, dto.email, hashedPassword, UserRole.ATHLETE, new Date(), new Date());
    const saved = await this.userRepo.save(user);
    const token = this.jwtService.sign({ id: saved.id, email: saved.email, role: saved.role });

    return UserMapper.toAuthResponse(saved, token);
  }
}
