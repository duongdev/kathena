import { forwardRef, Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'

import { AuthModule } from 'modules/auth/auth.module'
import { OrgModule } from 'modules/org/org.module'

import { OrgOffice } from './models/OrgOffice'
import { OrgOfficeResolver } from './OrgOffice.resolver'
import { OrgOfficeService } from './orgOffice.service'

@Module({
  imports: [
    TypegooseModule.forFeature([OrgOffice]),
    forwardRef(() => AuthModule),
    forwardRef(() => OrgModule),
  ],
  providers: [OrgOfficeService, OrgOfficeResolver],
  exports: [OrgOfficeService],
})
export class OrgOfficeModule {}
