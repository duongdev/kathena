import { Global, Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'

import { Course } from 'modules/academic/models/Course'
import { AccountModule } from 'modules/account/account.module'
import { AuthModule } from 'modules/auth/auth.module'
import { FileStorageModule } from 'modules/fileStorage/fileStorage.module'
import { OrgModule } from 'modules/org/org.module'

import { CommentResolver } from './comment.resolver'
import { CommentService } from './comment.service'
import { Comment } from './model/Comment'

@Global()
@Module({
  imports: [
    AuthModule,
    AccountModule,
    FileStorageModule,
    OrgModule,
    TypegooseModule.forFeature([Comment, Course]),
  ],
  providers: [CommentService, CommentResolver],
  exports: [CommentService],
})
export class CommentModule {}
