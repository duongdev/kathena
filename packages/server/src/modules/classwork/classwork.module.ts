import { forwardRef, Global, Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'

import { AccountModule } from 'modules/account/account.module'
import { Account } from 'modules/account/models/Account'
import { AuthModule } from 'modules/auth/auth.module'
import { Course } from 'modules/course/models/Course'
import { FileStorageModule } from 'modules/fileStorage/fileStorage.module'
import { MailModule } from 'modules/mail/mail.module'
import { OrgModule } from 'modules/org/org.module'

import { ClassworkService } from './classwork.service'
import { ClassworkAssignmentsResolver } from './classworkAssignments.resolver'
import { ClassworkMaterialResolver } from './classworkMaterial.resolver'
import { ClassworkSubmissionResolver } from './classworkSubmission.resolver'
import { ClassworkAssignment } from './models/ClassworkAssignment'
import { ClassworkMaterial } from './models/ClassworkMaterial'
import { ClassworkSubmission } from './models/ClassworkSubmission'

@Global()
@Module({
  imports: [
    TypegooseModule.forFeature([
      ClassworkAssignment,
      ClassworkMaterial,
      ClassworkSubmission,
      Course,
      Account,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => AccountModule),
    forwardRef(() => FileStorageModule),
    forwardRef(() => OrgModule),
    forwardRef(() => MailModule),
  ],
  providers: [
    ClassworkService,
    ClassworkMaterialResolver,
    ClassworkAssignmentsResolver,
    ClassworkSubmissionResolver,
  ],
  exports: [ClassworkService],
})
export class ClassworkModule {}
