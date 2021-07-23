import { forwardRef, Inject } from '@nestjs/common'
import { Resolver } from '@nestjs/graphql'

import { Logger } from 'core'

import { AcademicService } from './academic.service'
import { Lesson } from './models/Lesson'

@Resolver((_of) => Lesson)
export class LessonResolver {
  private readonly logger = new Logger(LessonResolver.name)

  constructor(
    @Inject(forwardRef(() => AcademicService))
    private readonly academicService: AcademicService,
  ) {}

  // TODO: [BE] Implement academicService.createLesson

  // TODO: [BE] Implement academicService.findAndPaginateLesson

  // TODO: [BE] Implement academicService.updateLessonById

  // TODO: [BE] Implement academicService.updateLessonPublicationById
}
