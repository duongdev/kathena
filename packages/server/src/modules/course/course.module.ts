import { forwardRef, Global, Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'

import { AcademicModule } from 'modules/academic/academic.module'
import { AccountModule } from 'modules/account/account.module'
import { AuthModule } from 'modules/auth/auth.module'
import { ClassworkModule } from 'modules/classwork/classwork.module'
import { ClassworkAssignment } from 'modules/classwork/models/ClassworkAssignment'
import { OrgOfficeModule } from 'modules/orgOffice/orgOffice.module'

import { CourseResolver } from './course.resolver'
import { CourseService } from './course.service'
import { Course } from './models/Course'

@Global()
@Module({
  imports: [
    TypegooseModule.forFeature([ClassworkAssignment, Course]),
    forwardRef(() => ClassworkModule),
    forwardRef(() => AuthModule),
    forwardRef(() => AccountModule),
    forwardRef(() => OrgOfficeModule),
    forwardRef(() => AcademicModule),
  ],
  providers: [CourseService, CourseResolver],
  exports: [CourseService],
})
export class CourseModule {}
