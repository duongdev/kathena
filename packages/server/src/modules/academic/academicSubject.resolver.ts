import { UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'

import { CurrentAccount, CurrentOrg, UseAuthGuard } from 'core'
import { Account } from 'modules/account/models/Account'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'

import { AcademicService } from './academic.service'
import { CreateAcademicSubjectInput } from './academic.type'
import { AcademicSubject } from './models/AcademicSubject'

@Resolver((_of) => AcademicSubject)
export class AcademicSubjectResolver {
  constructor(private readonly academicService: AcademicService) {}

  @Mutation((_returns) => AcademicSubject)
  @UseAuthGuard(P.Academic_CreateAcademicSubject)
  @UsePipes(ValidationPipe)
  async createAcademicSubject(
    @Args('input') academicSubjectInput: CreateAcademicSubjectInput,
    @CurrentAccount() account: Account,
    @CurrentOrg() org: Org,
  ): Promise<AcademicSubject> {
    const academicSubject = await this.academicService.createAcademicSubject({
      ...academicSubjectInput,
      orgId: org.id,
      createdByAccountId: account.id,
    })

    return academicSubject
  }
}
