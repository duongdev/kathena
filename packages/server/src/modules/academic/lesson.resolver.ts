import { forwardRef, Inject, UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { DocumentType } from '@typegoose/typegoose'
import { ForbiddenError } from 'type-graphql'

import { Logger } from 'core'
import { CurrentOrg, UseAuthGuard } from 'core/auth'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'
import { PageOptionsInput } from 'types'

import { AcademicService } from './academic.service'
import {
  CreateLessonInput,
  LessonsFilterInput,
  LessonsPayload,
} from './academic.type'
import { Lesson } from './models/Lesson'

@Resolver((_of) => Lesson)
export class LessonResolver {
  private readonly logger = new Logger(LessonResolver.name)

  constructor(
    @Inject(forwardRef(() => AcademicService))
    private readonly academicService: AcademicService,
  ) {}

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

  @Query((_returns) => LessonsPayload)
  @UseAuthGuard(P.Academic_ListLesson)
  async lessons(
    @Args('pageOptions', { type: () => PageOptionsInput })
    pageOptions: PageOptionsInput,
    @CurrentOrg() org: Org,
    @Args('filter', { type: () => LessonsFilterInput })
    filter: LessonsFilterInput,
  ): Promise<LessonsPayload> {
    if (org.id !== filter.orgId) {
      throw new ForbiddenError()
    }
    return this.academicService.findAndPaginateLessons(pageOptions, filter)
  }
  // TODO: [BE] Implement academicService.updateLessonById

  // TODO: [BE] Implement academicService.updateLessonPublicationById
}
