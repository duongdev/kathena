import { Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'
import { User } from './models/User'
import { UserResolver } from './users.resolver'
import { UsersService } from './users.service'

@Module({
  imports: [TypegooseModule.forFeature([User])],
  providers: [UserResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
