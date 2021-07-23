import { Module } from '@nestjs/common'

import { AccountModule } from 'modules/account/account.module'
import { OrgModule } from 'modules/org/org.module'

import { DevtoolService } from './devtool.service'

@Module({
  imports: [AccountModule, OrgModule],
  providers: [DevtoolService],
})
export class DevtoolModule {}
