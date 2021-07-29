import { forwardRef, Inject, UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { DocumentType } from '@typegoose/typegoose'

import { Logger } from 'core'
import { CurrentOrg, UseAuthGuard } from 'core/auth'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'

import { AcademicService } from './academic.service'
import { CreateLessonInput } from './academic.type'
import { Lesson } from './models/Lesson'

@Resolver((_of) => Lesson)
export class LessonResolver {
  private readonly logger = new Logger(LessonResolver.name)

  constructor(
    @Inject(forwardRef(() => AcademicService))
    private readonly academicService: AcademicService,
  ) {}

  // TODO: [BE] Implement academicService.createLesson
  @Mutation((_returns) => Lesson)
  @UseAuthGuard(P.Academic_CreateLesson)
  @UsePipes(ValidationPipe)
  async createLesson(
    @Args('createLessonInput', { type: () => CreateLessonInput })
    createLessonInput: CreateLessonInput,
    @CurrentOrg() org: Org,
  ): Promise<DocumentType<Lesson>> {
    return this.academicService.createLesson(org.id, createLessonInput)
  }
  // TODO: [BE] Implement academicService.findAndPaginateLesson

  // TODO: [BE] Implement academicService.updateLessonById

  // TODO: [BE] Implement academicService.updateLessonPublicationById
}
