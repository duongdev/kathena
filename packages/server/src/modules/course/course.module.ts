import { forwardRef, Global, Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'

import { AcademicModule } from 'modules/academic/academic.module'
import { AccountModule } from 'modules/account/account.module'
import { AuthModule } from 'modules/auth/auth.module'
import { ClassworkModule } from 'modules/classwork/classwork.module'
import { ClassworkAssignment } from 'modules/classwork/models/ClassworkAssignment'
import { ClassworkMaterial } from 'modules/classwork/models/ClassworkMaterial'
import { LessonModule } from 'modules/lesson/lesson.module'
import { Lesson } from 'modules/lesson/models/Lesson'
import { OrgOfficeModule } from 'modules/orgOffice/orgOffice.module'
import { QuizModule } from 'modules/quiz/quiz.module'

import { CourseResolver } from './course.resolver'
import { CourseService } from './course.service'
import { Course } from './models/Course'

@Global()
@Module({
  imports: [
    TypegooseModule.forFeature([
      ClassworkAssignment,
      ClassworkMaterial,
      Course,
      Lesson,
    ]),
    forwardRef(() => ClassworkModule),
    forwardRef(() => AuthModule),
    forwardRef(() => AccountModule),
    forwardRef(() => OrgOfficeModule),
    forwardRef(() => AcademicModule),
    forwardRef(() => LessonModule),
    forwardRef(() => QuizModule),
  ],
  providers: [CourseService, CourseResolver],
  exports: [CourseService],
})
export class CourseModule {}
