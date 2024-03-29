import { forwardRef, Global, Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'

import { AuthModule } from 'modules/auth/auth.module'
import { FileStorageModule } from 'modules/fileStorage/fileStorage.module'
import { MailModule } from 'modules/mail/mail.module'

import { AccountResolver } from './account.resolver'
import { AccountService } from './account.service'
import { Account } from './models/Account'

@Global()
@Module({
  imports: [
    MailModule,
    forwardRef(() => AuthModule),
    forwardRef(() => FileStorageModule),
    TypegooseModule.forFeature([Account]),
  ],
  providers: [AccountService, AccountResolver],
  exports: [AccountService],
})
export class AccountModule {}
