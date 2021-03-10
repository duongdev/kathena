import { Field, InputType } from '@nestjs/graphql'
import { IsEmail } from 'class-validator'

import { AccountStatus } from './models/Account'

@InputType()
export class CreateAccountInput {
  @Field()
  username: string

  @Field()
  @IsEmail()
  email: string

  @Field()
  password: string

  status?: AccountStatus

  createdByAccountId?: string

  orgId: string
}
