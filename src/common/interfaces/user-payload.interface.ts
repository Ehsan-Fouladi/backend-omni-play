import { UserRole, UserStatus } from '@modules/auth/entities/auth.entity';

export interface UserPayload {
  userId: number;
  email: string;
  role: UserRole;
  status: UserStatus;
}
