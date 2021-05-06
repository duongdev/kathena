import { Global, Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'

import { AuthModule } from 'modules/auth/auth.module'

import { ClassworkService } from './classwork.service'
import { ClassworkAssignmentsResolver } from './classworkAssignments.resolver'
import { ClassworkMaterialResolver } from './classworkMaterial.resolver'
import { ClassworkAssignments } from './models/ClassworkAssignments'
import { ClassworkMaterial } from './models/ClassworkMaterial'

@Global()
@Module({
  imports: [
    AuthModule,
    TypegooseModule.forFeature([ClassworkAssignments, ClassworkMaterial]),
  ],
  providers: [
    ClassworkService,
    ClassworkMaterialResolver,
    ClassworkAssignmentsResolver,
  ],
  exports: [ClassworkService],
})
export class ClassworkModule {}
