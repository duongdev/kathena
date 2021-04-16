import { forwardRef, Inject, UsePipes, ValidationPipe } from '@nestjs/common'
import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { differenceInMinutes } from 'date-fns'
import { ForbiddenError } from 'type-graphql'

import { CurrentAccount, CurrentOrg, UseAuthGuard } from 'core/auth'
import { AuthService } from 'modules/auth/auth.service'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'
import { Nullable, PageOptionsInput } from 'types'

import { AccountService } from './account.service'
import {
  CreateAccountInput,
  OrgAccountsPayload,
  UpdateAccountInput,
} from './account.type'
import { Account, AccountAvailability, AccountStatus } from './models/Account'

@Resolver((_of) => Account)
export class AccountResolver {
  constructor(
    private readonly accountService: AccountService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  @Mutation((_returns) => Account)
  @UseAuthGuard(P.Hr_CreateOrgAccount)
  @UsePipes(ValidationPipe)
  async createOrgAccount(
    @Args('input') createAccountInput: CreateAccountInput,
    @CurrentAccount() account: Account,
    @CurrentOrg() org: Org,
  ): Promise<Account> {
    return this.accountService.createOrgMemberAccount(account.id, {
      ...createAccountInput,
      createdByAccountId: account.id,
      orgId: org.id,
    })
  }

  @Query((_returns) => Account, { nullable: true })
  @UseAuthGuard()
  async account(
    @Args('id', { type: () => ID }) id: string,
    @CurrentOrg() org: Org,
  ): Promise<Nullable<Account>> {
    return this.accountService.findOneAccount({ id, orgId: org.id })
  }

  @Query((_returns) => Account, { nullable: true })
  @UseAuthGuard()
  async accountByUserName(
    @Args('username') username: string,
    @CurrentOrg() org: Org,
  ): Promise<Nullable<Account>> {
    return this.accountService.findAccountByUsernameOrEmail({
      usernameOrEmail: username,
      orgId: org.id,
    })
  }

  @Query((_return) => OrgAccountsPayload)
  @UseAuthGuard(P.Hr_ListOrgAccounts)
  async orgAccounts(
    @Args('orgId', { type: () => ID }) orgId: string,
    @Args('pageOptions') pageOptions: PageOptionsInput,
    @CurrentOrg() org: Org,
  ): Promise<OrgAccountsPayload> {
    if (org.id !== orgId) {
      throw new ForbiddenError()
    }
    return this.accountService.findAndPaginateAccounts({ orgId }, pageOptions)
  }

  @Mutation((_returns) => Account)
  @UseAuthGuard()
  @UsePipes(ValidationPipe)
  async updateAccount(
    @Args('id', { type: () => ID }) accountId: string,
    @Args('updateInput') updateInput: UpdateAccountInput,
    @CurrentAccount() currentAccount: Account,
    @CurrentOrg() currentOrg: Org,
  ): Promise<Account> {
    return this.accountService.updateOrgMemberAccount(
      currentAccount.id,
      {
        id: accountId,
        orgId: currentOrg.id,
      },
      updateInput,
    )
  }

  @Mutation((_returns) => Account)
  @UseAuthGuard(P.Hr_UpdateOrgAccountStatus)
  @UsePipes(ValidationPipe)
  async updateAccountStatus(
    @Args('id', { type: () => ID }) accountId: string,
    @Args('status', { type: () => String }) status: AccountStatus,
    @CurrentAccount() currentAccount: Account,
    @CurrentOrg() currentOrg: Org,
  ): Promise<Account> {
    return this.accountService.updateOrgMemberAccountStatus(
      currentAccount.id,
      {
        id: accountId,
        orgId: currentOrg.id,
      },
      status,
    )
  }

  @ResolveField((_returns) => AccountAvailability)
  availability(@Parent() account: Account): AccountAvailability {
    if (!account.lastActivityAt) {
      return AccountAvailability.Offline
    }

    const minutesDiff = differenceInMinutes(account.lastActivityAt, new Date())

    if (minutesDiff <= 1) {
      return AccountAvailability.Online
    }
    if (minutesDiff <= 5) {
      return AccountAvailability.Away
    }

    return AccountAvailability.Offline
  }
}
