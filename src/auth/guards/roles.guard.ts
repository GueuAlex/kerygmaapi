import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifie');
    }

    const hasRole = requiredRoles.some((role) => (user as any).role === role);

    if (!hasRole) {
      const rolesText = requiredRoles.join(', ');
      throw new ForbiddenException(
        `Acces refuse. Roles requis: ${rolesText}. Votre role actuel: ${(user as any).role}`,
      );
    }

    return true;
  }
}
