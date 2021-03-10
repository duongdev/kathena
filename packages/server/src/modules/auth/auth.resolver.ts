import { Args, Mutation, Resolver } from '@nestjs/graphql'

import { AuthService } from './auth.service'

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation((_returns) => String)
  async signIn(
    @Args('orgId') orgId: string,
    @Args('identity', { description: `Could be username or email` })
    identity: string,
    @Args('password') password: string,
  ): Promise<string> {
    return this.authService.signIn({
      orgNamespace: orgId,
      usernameOrEmail: identity,
      password,
    })
  }
}
