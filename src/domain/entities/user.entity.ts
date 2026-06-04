import { UserRole } from '../enums/user-role.enum';

export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public password: string,
    public role: UserRole,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public avatarUrl?: string | null,
  ) {}
}
