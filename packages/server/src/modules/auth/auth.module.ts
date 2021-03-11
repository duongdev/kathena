import { Global, Module } from '@nestjs/common'

import { AccountModule } from 'modules/account/account.module'
import { OrgModule } from 'modules/org/org.module'

import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'

@Global()
@Module({
  imports: [AccountModule, OrgModule],
  providers: [AuthResolver, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
