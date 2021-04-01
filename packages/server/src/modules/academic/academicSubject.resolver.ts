import { UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { ForbiddenError } from 'type-graphql'

import { CurrentAccount, CurrentOrg, UseAuthGuard } from 'core'
import { Account } from 'modules/account/models/Account'
import { P } from 'modules/auth/models'
import { FileStorageService } from 'modules/fileStorage/fileStorage.service'
import { Org } from 'modules/org/models/Org'
import { PageOptionsInput } from 'types'

import { AcademicService } from './academic.service'
import {
  AcademicSubjectPayload,
  CreateAcademicSubjectInput,
} from './academic.type'
import { AcademicSubject } from './models/AcademicSubject'

@Resolver((_of) => AcademicSubject)
export class AcademicSubjectResolver {
  constructor(
    private readonly academicService: AcademicService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  @Mutation((_returns) => AcademicSubject)
  @UseAuthGuard(P.Academic_CreateAcademicSubject)
  @UsePipes(ValidationPipe)
  async createAcademicSubject(
    @Args('input') academicSubjectInput: CreateAcademicSubjectInput,
    @CurrentAccount() account: Account,
    @CurrentOrg() org: Org,
  ): Promise<AcademicSubject | null> {
    const image = await academicSubjectInput.image

    const { createReadStream, filename, encoding } = image

    // eslint-disable-next-line no-console
    console.log('encoding', encoding)

    const imageFile = await this.fileStorageService.uploadFromReadStream({
      orgId: org.id,
      originalFileName: filename,
      readStream: createReadStream(),
      uploadedByAccountId: account.id,
    })

    const academicSubject = await this.academicService.createAcademicSubject({
      ...academicSubjectInput,
      orgId: org.id,
      createdByAccountId: account.id,
      imageFileId: imageFile.id,
    })

    return academicSubject
  }

  @Query((_return) => AcademicSubjectPayload)
  @UseAuthGuard(P.Academic_ListAcademicSubject)
  async academicSubjects(
    @Args('orgId', { type: () => ID }) orgId: string,
    @Args('pageOptions') pageOptions: PageOptionsInput,
    @CurrentOrg() org: Org,
  ): Promise<AcademicSubjectPayload> {
    if (org.id !== orgId) {
      throw new ForbiddenError()
    }
    return this.academicService.findAndPaginateAcademicSubject(
      { orgId },
      pageOptions,
    )
  }
}
