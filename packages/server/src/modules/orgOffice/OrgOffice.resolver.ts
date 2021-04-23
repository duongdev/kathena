import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { ForbiddenError } from 'type-graphql'

import { CurrentAccount, CurrentOrg, UseAuthGuard } from 'core'
import { Account } from 'modules/account/models/Account'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'

import { OrgOffice } from './models/OrgOffice'
import { OrgOfficeService } from './orgOffice.service'
import { CreateOrgOfficeInput, UpdateOrgOfficeInput } from './orgOffice.types'

@Resolver((_of) => OrgOffice)
export class OrgOfficeResolver {
  constructor(private readonly orgOfficeService: OrgOfficeService) {}

  @Query((_returns) => [OrgOffice])
  @UseAuthGuard(P.OrgOffice_ListOrgOffices)
  async orgOffices(@CurrentOrg() org: Org): Promise<OrgOffice[]> {
    return this.orgOfficeService.findOrgOfficesByOrgId(org.id)
  }

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

  @Mutation((_returns) => OrgOffice)
  @UseAuthGuard(P.OrgOffice_UpdateOrgOffice)
  async updateOrgOffice(
    @Args('id', { type: () => ID }) orgOfficeId: string,
    @Args('input', { type: () => UpdateOrgOfficeInput })
    input: UpdateOrgOfficeInput,
    @CurrentOrg() org: Org,
  ): Promise<OrgOffice> {
    return this.orgOfficeService.updateOrgOffice(
      {
        id: orgOfficeId,
        orgId: org.id,
      },
      input,
    )
  }

  @Mutation((_returns) => [OrgOffice])
  @UseAuthGuard(P.OrgOffice_ListOrgOffices)
  async findOrgOffices(
    @CurrentOrg() org: Org,
    @Args('orgId', { type: () => ID, nullable: true }) orgId: string,
    @Args('searchText', { type: () => String, nullable: true })
    searchText?: string,
  ): Promise<OrgOffice[]> {
    if (orgId !== org.id) {
      throw new ForbiddenError()
    }
    return this.orgOfficeService.findOrgOffices(orgId, searchText)
  }
}
