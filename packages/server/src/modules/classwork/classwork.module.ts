import { Global, Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'

import { AuthModule } from 'modules/auth/auth.module'

import { AssignmentsResolver } from './assignments.resolver'
import { ClassworkService } from './classwork.service'
import { MaterialResolver } from './material.resolver'
import { Classwork } from './models/Classwork'

@Global()
@Module({
  imports: [AuthModule, TypegooseModule.forFeature([Classwork])],
  providers: [ClassworkService, MaterialResolver, AssignmentsResolver],
  exports: [ClassworkService],
})
export class AccountModule {}
