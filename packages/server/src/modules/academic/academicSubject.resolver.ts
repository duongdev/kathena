import { UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { DocumentType } from '@typegoose/typegoose'
import { ForbiddenError } from 'type-graphql'

import { CurrentAccount, CurrentOrg, Publication, UseAuthGuard } from 'core'
import { Account } from 'modules/account/models/Account'
import { P } from 'modules/auth/models'
import { FileStorageService } from 'modules/fileStorage/fileStorage.service'
import { Org } from 'modules/org/models/Org'
import { Nullable, PageOptionsInput } from 'types'

import { AcademicService } from './academic.service'
import {
  AcademicSubjectsPayload,
  CreateAcademicSubjectInput,
  UpdateAcademicSubjectInput,
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

  @Query((_return) => AcademicSubjectsPayload)
  @UseAuthGuard(P.Academic_ListAcademicSubjects)
  async academicSubjects(
    @Args('orgId', { type: () => ID }) orgId: string,
    @Args('pageOptions') pageOptions: PageOptionsInput,
    @CurrentOrg() org: Org,
  ): Promise<AcademicSubjectsPayload> {
    if (org.id !== orgId) {
      throw new ForbiddenError()
    }
    return this.academicService.findAndPaginateAcademicSubjects(
      { orgId },
      pageOptions,
    )
  }

  @Mutation((_returns) => AcademicSubject)
  @UseAuthGuard(P.Academic_SetAcademicSubjectPublication)
  @UsePipes(ValidationPipe)
  async updateAcademicSubjectPublication(
    @Args('id', { type: () => ID }) academicSubjectId: string,
    @Args('publication', { type: () => String }) publication: Publication,
  ): Promise<AcademicSubject> {
    return this.academicService.updateAcademicSubjectPublication(
      academicSubjectId,
      publication,
    )
  }

  @Query((_return) => AcademicSubject)
  @UseAuthGuard(P.Academic_ListAcademicSubjects)
  async academicSubject(
    @Args('id', { type: () => ID }) academicSubjectId: string,
  ): Promise<Nullable<DocumentType<AcademicSubject>>> {
    return this.academicService.findAcademicSubjectById(academicSubjectId)
  }

  @Mutation((_returns) => AcademicSubject)
  @UseAuthGuard(P.Academic_UpdateAcademicSubject)
  @UsePipes(ValidationPipe)
  async updateAcademicSubject(
    @Args('id', { type: () => ID }) academicSubjectId: string,
    @Args('updateInput') updateInput: UpdateAcademicSubjectInput,
    @CurrentOrg() currentOrg: Org,
  ): Promise<AcademicSubject> {
    return this.academicService.updateAcademicSubject(
      {
        id: academicSubjectId,
        orgId: currentOrg.id,
      },
      updateInput,
    )
  }
}
