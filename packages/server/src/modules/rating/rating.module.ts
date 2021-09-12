import { Global, Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'

import { AuthModule } from 'modules/auth/auth.module'
import { Lesson } from 'modules/lesson/models/Lesson'
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
