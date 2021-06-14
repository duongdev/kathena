import { UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'

import { CurrentAccount, CurrentOrg, UseAuthGuard } from 'core'
import { Account } from 'modules/account/models/Account'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'
import { Nullable } from 'types'

import { ClassworkService } from './classwork.service'
import {
  CreateClassworkSubmissionInput,
  SetGradeForClassworkSubmissionInput,
} from './classwork.type'
import { ClassworkSubmission } from './models/ClassworkSubmission'

@Resolver((_of) => ClassworkSubmission)
export class ClassworkSubmissionResolver {
  constructor(private readonly classworkService: ClassworkService) {}

  @Mutation((_return) => ClassworkSubmission)
  @UseAuthGuard(P.Classwork_CreateClassworkSubmission)
  @UsePipes(ValidationPipe)
  async createClassworkSubmission(
    @Args('courseId', { type: () => ID }) courseId: string,
    @Args('createClassworkSubmissionInput')
    createClassworkSubmissionInput: CreateClassworkSubmissionInput,
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
  ): Promise<ClassworkSubmission> {
    return this.classworkService.createClassworkSubmission(
      org.id,
      courseId,
      account.id,
      createClassworkSubmissionInput,
    )
  }

  @Mutation((_return) => ClassworkSubmission)
  @UseAuthGuard(P.Classwork_SetGradeForClassworkSubmission)
  @UsePipes(ValidationPipe)
  async setGradeForClassworkSubmission(
    @Args('courseId', { type: () => ID }) courseId: string,
    @Args('setGradeForClassworkSubmissionInput')
    setGradeForClassworkSubmissionInput: SetGradeForClassworkSubmissionInput,
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
  ): Promise<ClassworkSubmission> {
    return this.classworkService.setGradeForClassworkSubmission(
      org.id,
      account.id,
      setGradeForClassworkSubmissionInput,
    )
  }

  @Query((_return) => [ClassworkSubmission])
  @UseAuthGuard(P.Classwork_ListClassworkSubmission)
  @UsePipes(ValidationPipe)
  async classworkSubmissions(
    @Args('classworkAssignmentId', { type: () => ID })
    classworkAssignmentId: string,
    @CurrentAccount() account: Account,
    @CurrentOrg() org: Org,
  ): Promise<ClassworkSubmission[]> {
    return this.classworkService.listClassworkSubmissionsByClassworkAssignmentId(
      account.id,
      org.id,
      classworkAssignmentId,
    )
  }

  @Query((_return) => ClassworkSubmission)
  @UseAuthGuard(P.Classwork_ListClassworkSubmission)
  @UsePipes(ValidationPipe)
  async findClassworkSubmissionById(
    @Args('classworkSubmissionId', { type: () => ID })
    classworkSubmissionId: string,
    @CurrentOrg() org: Org,
  ): Promise<Nullable<ClassworkSubmission>> {
    return this.classworkService.findClassworkSubmissionById(
      org.id,
      classworkSubmissionId,
    )
  }
}
