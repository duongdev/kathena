import { Global, Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'

import { AuthModule } from 'modules/auth/auth.module'

import { AccountResolver } from './account.resolver'
import { AccountService } from './account.service'
import { Account } from './models/Account'

@Global()
@Module({
  imports: [AuthModule, TypegooseModule.forFeature([Account])],
  providers: [AccountService, AccountResolver],
  exports: [AccountService],
})
export class AccountModule {}
