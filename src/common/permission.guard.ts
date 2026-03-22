import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from './permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<{ resource: string; action: string }>(
      PERMISSION_KEY, [context.getHandler(), context.getClass()],
    );
    if (!required) return true;
    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Not authenticated');
    const role = user.role;
    if (!role) throw new ForbiddenException('No role assigned');
    if (role.isSystem) return true;
    const hasPermission = role.permissions?.some(
      (p: any) => p.resource === required.resource && (p.actions.includes('manage') || p.actions.includes(required.action)),
    );
    if (!hasPermission) throw new ForbiddenException(`Your role does not have '${required.action}' access to '${required.resource}'`);
    return true;
  }
}
