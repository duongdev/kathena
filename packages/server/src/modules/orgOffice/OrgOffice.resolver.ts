import { Args, Mutation, Resolver } from '@nestjs/graphql'

import { CurrentAccount, CurrentOrg, UseAuthGuard } from 'core'
import { Account } from 'modules/account/models/Account'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'

import { OrgOffice } from './models/OrgOffice'
import { OrgOfficeService } from './orgOffice.service'
import { CreateOrgOfficeInput } from './orgOffice.types'

@Resolver((_of) => OrgOffice)
export class OrgOfficeResolver {
  constructor(private readonly orgOfficeService: OrgOfficeService) {}

  @Mutation((_returns) => OrgOffice)
  @UseAuthGuard(P.OrgOffice_CreateOrgOffice)
  async createOrgOffice(
    @Args('input', { type: () => CreateOrgOfficeInput })
    input: CreateOrgOfficeInput,
    @CurrentAccount() account: Account,
    @CurrentOrg() org: Org,
  ): Promise<OrgOffice> {
    return this.orgOfficeService.createOrgOffice({
      ...input,
      createdByAccountId: account.id,
      orgId: org.id,
    })
  }
}
