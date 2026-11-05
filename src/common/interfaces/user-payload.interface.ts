import { UserRole, UserStatus } from 'src/modules/auth/entities/auth.entity';

export interface UserPayload {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  status: UserStatus;
}
