import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesService } from '../../modules/roles/roles.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rolesService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<{
      resource: string;
      actions: string[];
    }>('permissions', [context.getHandler(), context.getClass()]);

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifie');
    }

    const { resource, actions } = requiredPermissions;

    // Vérifier chaque action requise
    for (const action of actions) {
      const hasPermission = await this.rolesService.hasPermission(
        (user as any).userId,
        resource,
        action,
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `Permission refusee. Ressource: ${resource}, Action: ${action}`,
        );
      }
    }

    return true;
  }
}