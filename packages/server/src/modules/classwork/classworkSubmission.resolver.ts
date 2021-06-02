import { UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, ID, Mutation, Resolver } from '@nestjs/graphql'

import { CurrentOrg, UseAuthGuard } from 'core'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'

import { ClassworkService } from './classwork.service'
import { CreateClassworkSubmissionInput } from './classwork.type'
import { ClassworkSubmission } from './models/ClassworkSubmission'

@Resolver((_of) => ClassworkSubmission)
export class ClassworkSubmissionResolver {
  constructor(private readonly classworkService: ClassworkService) {}

  @Mutation((_return) => ClassworkSubmission)
  @UseAuthGuard(P.Classwork_CreateClassworkSubmission)
  @UsePipes(ValidationPipe)
  async createClassworkSubmission(
    @Args('courseId', { type: () => ID }) courseId: string,
    @Args('CreateClassworkMaterialInput')
    createClassworkSubmissionInput: CreateClassworkSubmissionInput,
    @CurrentOrg() org: Org,
  ): Promise<ClassworkSubmission> {
    return this.classworkService.createClassworkSubmission(
      org.id,
      courseId,
      createClassworkSubmissionInput,
    )
  }
}
