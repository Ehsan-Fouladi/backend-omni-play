import { UserRole, UserStatus } from 'src/modules/auth/entities/auth.entity';

export interface UserPayload {
  userId: number;
  email: string;
  role: UserRole;
  status: UserStatus;
}
