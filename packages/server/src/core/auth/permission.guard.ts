import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'

import { Account } from 'modules/account/models/Account'
import { AuthService } from 'modules/auth/auth.service'
import { Permission } from 'modules/auth/models/Permission'

export const PERMISSION_KEY = 'permission'

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<Permission>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!requiredPermission) return true

    const { account }: { account: Account } = GqlExecutionContext.create(
      context,
    ).getContext()

    const hasPermission = await this.authService.accountHasPermission({
      accountId: account.id,
      permission: requiredPermission,
    })

    return hasPermission
  }
}
