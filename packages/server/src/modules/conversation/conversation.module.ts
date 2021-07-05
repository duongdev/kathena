import { Global, Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'

import { Course } from 'modules/academic/models/Course'
import { AccountModule } from 'modules/account/account.module'
import { AuthModule } from 'modules/auth/auth.module'
import { FileStorageModule } from 'modules/fileStorage/fileStorage.module'
import { OrgModule } from 'modules/org/org.module'

import { ConversationResolver } from './conversation.resolver'
import { ConversationService } from './conversation.service'
import { Conversation } from './model/Conversation'

@Global()
@Module({
  imports: [
    AuthModule,
    AccountModule,
    FileStorageModule,
    OrgModule,
    TypegooseModule.forFeature([Conversation, Course]),
  ],
  providers: [ConversationService, ConversationResolver],
  exports: [ConversationService],
})
export class ConversationModule {}
