import { Global, Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'

import { Org } from './models/Org'
import { OrgService } from './org.service'

@Global()
@Module({
  imports: [TypegooseModule.forFeature([Org])],
  providers: [OrgService],
  exports: [OrgService],
})
export class OrgModule {}
