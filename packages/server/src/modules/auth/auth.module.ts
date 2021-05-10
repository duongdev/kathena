import { forwardRef, Global, Module } from '@nestjs/common'

import { AcademicService } from 'modules/academic/academic.service'
import { AccountModule } from 'modules/account/account.module'
import { OrgModule } from 'modules/org/org.module'

import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'

@Global()
@Module({
  imports: [
    forwardRef(() => AccountModule),
    forwardRef(() => AcademicService),
    OrgModule,
  ],
  providers: [AuthResolver, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
