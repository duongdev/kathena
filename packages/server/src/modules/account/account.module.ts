import { Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'

import { AccountResolver } from './account.resolver'
import { AccountService } from './account.service'
import { Account } from './models/Account'

@Module({
  imports: [TypegooseModule.forFeature([Account])],
  providers: [AccountService, AccountResolver],
  exports: [AccountService],
})
export class AccountModule {}
