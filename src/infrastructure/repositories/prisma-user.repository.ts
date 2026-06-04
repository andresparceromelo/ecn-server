import { PrismaClient, User as PrismaUserModel } from '@prisma/client';
import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { UserRepository, RoleCount } from '../../domain/interfaces/user.repository';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async save(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role as unknown as PrismaUserModel['role'],
        avatarUrl: user.avatarUrl,
      },
    });
    return this.toDomain(created);
  }

  async countAll(): Promise<number> {
    return this.prisma.user.count();
  }

  async countByRole(): Promise<RoleCount[]> {
    const result = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
    });
    return result.map((r) => ({ role: r.role as unknown as string, count: r._count.id }));
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });
    return this.toDomain(updated);
  }

  private toDomain(user: PrismaUserModel): User {
    return new User(
      user.id,
      user.name,
      user.email,
      user.password,
      user.role as unknown as UserRole,
      user.createdAt,
      user.updatedAt,
      user.avatarUrl,
    );
  }
}
