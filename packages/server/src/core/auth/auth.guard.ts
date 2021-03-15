import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'
import { verify } from 'jsonwebtoken'

import { config, Logger } from 'core'
import { AccountService } from 'modules/account/account.service'
import { AuthData } from 'modules/auth/auth.type'
import { OrgService } from 'modules/org/org.service'
import { ANY } from 'types'

@Injectable({ scope: Scope.REQUEST })
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name)

  constructor(
    private readonly accountService: AccountService,
    private readonly orgService: OrgService,
    @Inject(REQUEST) private request: ANY,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext()
    const token = this.request?.req?.headers?.authorization?.replace(
      /^Bearer\s/,
      '',
    )

    if (!token) {
      this.logger.verbose(`No token is provided`)
      return false
    }

    try {
      const tokenData: AuthData = verify(token, config.JWT_SECRET) as AuthData

      const { accountId, orgId } = tokenData

      ctx.accountId = accountId
      ctx.orgId = orgId

      if (!(accountId && orgId)) return false

      // eslint-disable-next-line @typescript-eslint/dot-notation
      const account = await this.accountService['accountModel'].findById(
        accountId,
      )

      if (!account) return false

      account.lastActivityAt = new Date()
      await account.save()

      ctx.account = account

      // eslint-disable-next-line @typescript-eslint/dot-notation
      const org = await this.orgService['orgModel'].findById(orgId)

      if (!org) return false

      ctx.org = org

      return true
    } catch (error) {
      this.logger.debug(error)
      return false
    }
  }
}
