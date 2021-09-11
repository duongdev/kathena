import { forwardRef, Global, Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'

import { AcademicModule } from 'modules/academic/academic.module'
import { Course } from 'modules/academic/models/Course'

import { LessonResolver } from './lesson.resolver'
import { LessonService } from './lesson.service'
import { Lesson } from './models/Lesson'

@Global()
@Module({
  imports: [
    TypegooseModule.forFeature([Lesson, Course]),
    forwardRef(() => AcademicModule),
  ],
  providers: [LessonService, LessonResolver],
  exports: [LessonService],
})
export class LessonModule {}
