import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserPayload } from '../interfaces/user-payload.interface';
import { UserRole } from 'src/modules/auth/entities/auth.entity';

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
