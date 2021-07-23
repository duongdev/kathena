import { Global, Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'

import { AccountModule } from 'modules/account/account.module'
import { AuthModule } from 'modules/auth/auth.module'
import { FileStorageModule } from 'modules/fileStorage/fileStorage.module'
import { OrgModule } from 'modules/org/org.module'

import { Rating } from './models/rating'
import { RatingResolver } from './rating.resolver'
import { RatingService } from './rating.service'

@Global()
@Module({
  imports: [
    AuthModule,
    AccountModule,
    FileStorageModule,
    OrgModule,
    TypegooseModule.forFeature([Rating]),
  ],
  providers: [RatingService, RatingResolver],
  exports: [RatingService],
})
export class RatingModule {}
