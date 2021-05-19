import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'

import { CurrentAccount, CurrentOrg, UseAuthGuard } from 'core'
import { Account } from 'modules/account/models/Account'
import { Org } from 'modules/org/models/Org'

import { AuthService } from './auth.service'
import { AuthenticatePayload, SignInPayload } from './auth.type'
import { OrgRoleName, Permission } from './models'

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query((_returns) => AuthenticatePayload)
  @UseAuthGuard()
  async authenticate(
    @CurrentAccount() account: Account,
    @CurrentOrg() org: Org,
  ): Promise<AuthenticatePayload> {
    const permissions = await this.authService.getAccountPermissions(account.id)
    return { account, org, permissions }
  }

  @Mutation((_returns) => SignInPayload)
  async signIn(
    @Args('orgNamespace') orgNamespace: string,
    @Args('identity', { description: `Could be username or email` })
    identity: string,
    @Args('password') password: string,
  ): Promise<{
    token: string
    account: Account
    permissions: Permission[]
    org: Org
  }> {
    return this.authService.signIn({
      orgNamespace,
      usernameOrEmail: identity,
      password,
    })
  }

  @Query((_returns) => Boolean)
  @UseAuthGuard()
  async canAccountManageRoles(
    @Args('roles', { type: () => [String] }) roles: OrgRoleName[],
    @CurrentAccount() account: Account,
    @CurrentOrg() org: Org,
  ): Promise<boolean> {
    const orgRoles = await this.authService.mapOrgRolesFromNames({
      orgId: org.id,
      roleNames: roles,
    })
    return this.authService.canAccountManageRoles(account.id, orgRoles)
  }
}
