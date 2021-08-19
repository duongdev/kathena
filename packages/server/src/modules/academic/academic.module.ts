import { forwardRef, Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'

import { AccountModule } from 'modules/account/account.module'
import { ClassworkAssignment } from 'modules/classwork/models/ClassworkAssignment'
import { FileStorageModule } from 'modules/fileStorage/fileStorage.module'
import { OrgModule } from 'modules/org/org.module'
import { OrgOfficeModule } from 'modules/orgOffice/orgOffice.module'

import { AcademicService } from './academic.service'
import { AcademicSubjectResolver } from './academicSubject.resolver'
import { CourseResolver } from './course.resolver'
import { LessonResolver } from './lesson.resolver'
import { AcademicSubject } from './models/AcademicSubject'
import { Course } from './models/Course'
import { Lesson } from './models/Lesson'

@Module({
  imports: [
    TypegooseModule.forFeature([
      AcademicSubject,
      Course,
      ClassworkAssignment,
      Lesson,
    ]),
    forwardRef(() => OrgModule),
    forwardRef(() => OrgOfficeModule),
    forwardRef(() => AccountModule),
    forwardRef(() => FileStorageModule),
  ],
  providers: [
    AcademicSubjectResolver,
    AcademicService,
    CourseResolver,
    LessonResolver,
  ],
  exports: [AcademicService],
})
export class AcademicModule {}
