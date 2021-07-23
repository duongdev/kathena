import { Global, Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'

import { Course } from 'modules/academic/models/Course'
import { AccountModule } from 'modules/account/account.module'
import { Account } from 'modules/account/models/Account'
import { AuthModule } from 'modules/auth/auth.module'
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
    AuthModule,
    AccountModule,
    FileStorageModule,
    OrgModule,
    MailModule,
    TypegooseModule.forFeature([
      ClassworkAssignment,
      ClassworkMaterial,
      ClassworkSubmission,
      Course,
      Account,
    ]),
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
