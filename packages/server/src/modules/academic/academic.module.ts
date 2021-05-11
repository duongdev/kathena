import { forwardRef, Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'

import { AccountService } from 'modules/account/account.service'
import { AuthService } from 'modules/auth/auth.service'
import { FileStorageModule } from 'modules/fileStorage/fileStorage.module'
import { OrgModule } from 'modules/org/org.module'
import { OrgService } from 'modules/org/org.service'

import { AcademicService } from './academic.service'
import { AcademicSubjectResolver } from './academicSubject.resolver'
import { CourseResolver } from './course.resolver'
import { AcademicSubject } from './models/AcademicSubject'
import { Course } from './models/Course'

@Module({
  imports: [
    TypegooseModule.forFeature([AcademicSubject, Course]),
    OrgModule,
    FileStorageModule,
  ],
  providers: [AcademicSubjectResolver, AcademicService, CourseResolver],
  exports: [AcademicService],
})
export class AcademicModule {}
