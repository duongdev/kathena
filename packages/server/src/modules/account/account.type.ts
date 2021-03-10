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

  /** Overrides default PENDING status on creation */
  status?: AccountStatus

  /** Referrals to another accountId who creates the new account */
  createdByAccountId?: string

  orgId: string
}
