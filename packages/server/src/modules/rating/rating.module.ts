import { Global, Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'

import { Lesson } from 'modules/academic/models/Lesson'
import { AuthModule } from 'modules/auth/auth.module'
import { OrgModule } from 'modules/org/org.module'

import { Rating } from './models/Rating'
import { RatingResolver } from './rating.resolver'
import { RatingService } from './rating.service'

@Global()
@Module({
  imports: [
    OrgModule,
    AuthModule,
    TypegooseModule.forFeature([Rating, Lesson]),
  ],
  providers: [RatingService, RatingResolver],
  exports: [RatingService],
})
export class RatingModule {}
