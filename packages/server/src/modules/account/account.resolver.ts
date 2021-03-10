import { Args, Mutation, Resolver } from '@nestjs/graphql'

import { AccountService } from './account.service'
import { CreateAccountInput } from './account.type'
import { Account } from './models/Account'

@Resolver((_of) => Account)
export class AccountResolver {
  constructor(private readonly accountService: AccountService) {}

  @Mutation((_returns) => Account)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<Account> {
    return this.accountService.createAccount(createAccountInput)
  }
}
