import { UserRole } from '@modules/auth/entities/auth.entity';

// export interface JwtPayload {
//   sub: number;
//   email: string;
//   role: UserRole;
//   status: UserStatus;
//   iat?: number;
//   exp?: number;
// }

export interface JwtPayload {
  sub: number;
  role: UserRole;
}
