import { forwardRef, Global, Module } from '@nestjs/common'

import { AcademicModule } from 'modules/academic/academic.module'
import { AccountModule } from 'modules/account/account.module'
import { OrgModule } from 'modules/org/org.module'

import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'

@Global()
@Module({
  imports: [
    forwardRef(() => AccountModule),
    OrgModule,
    forwardRef(() => AcademicModule),
  ],
  providers: [AuthResolver, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
