import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@common/decorators/roles.decorator';
import { UserRole } from '@modules/auth/entities/auth.entity';
import { UserPayload } from '@common/interfaces/user-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: UserPayload = request.user;

    if (!user || user.role === undefined) {
      throw new ForbiddenException('شما دسترسی لازم برای این بخش را ندارید');
    }

    const hasRole = () => requiredRoles.some((role) => user.role === role);

    if (hasRole()) {
      return true;
    }

    throw new ForbiddenException('شما دسترسی لازم برای این بخش را ندارید');
  }
}
