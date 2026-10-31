import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserPayload } from '../interfaces/user-payload.interface';
import { UserStatus } from 'src/modules/auth/entities/auth.entity';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly auth: AuthService,
  ) {
    const secret =
      configService.get<string>('JWT_SECRET') || 'default-secret-key';
    if (!secret) {
      throw new Error('کلید مخفی JWT در متغیرهای محیطی (.env) تنظیم نشده است!');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<UserPayload> {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('توکن نامعتبر است');
    }

    const user = await this.auth.validation(payload.sub);

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('حساب کاربری غیرفعال یا مسدود است');
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }
}
