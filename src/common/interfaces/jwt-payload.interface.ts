import { UserRole } from 'src/modules/auth/entities/auth.entity';

export interface JwtPayload {
  sub: number;
  email: string;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
