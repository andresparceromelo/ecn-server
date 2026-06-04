import { User } from '../entities/user.entity';

export interface RoleCount {
  role: string;
  count: number;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  countAll(): Promise<number>;
  countByRole(): Promise<RoleCount[]>;
}
