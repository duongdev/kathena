import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import { CurrentAccount, CurrentOrg, UseAuthGuard } from 'core'
import { Account } from 'modules/account/models/Account'
import { Org } from 'modules/org/models/Org'

import { AuthService } from './auth.service'
import { AuthenticatePayload } from './auth.type'

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query((_returns) => AuthenticatePayload)
  @UseAuthGuard()
  async authenticate(
    @CurrentAccount() account: Account,
    @CurrentOrg() org: Org,
  ): Promise<AuthenticatePayload> {
    return { account, org }
  }

  @Mutation((_returns) => String)
  async signIn(
    @Args('orgNamespace') orgNamespace: string,
    @Args('identity', { description: `Could be username or email` })
    identity: string,
    @Args('password') password: string,
  ): Promise<string> {
    return this.authService.signIn({
      orgNamespace,
      usernameOrEmail: identity,
      password,
    })
  }
}
