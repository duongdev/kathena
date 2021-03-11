import { Field, InputType } from '@nestjs/graphql'
import { ArrayNotEmpty, IsEmail, MinLength } from 'class-validator'

import { ACCOUNT_PWD_MIN } from './account.const'
import { AccountStatus } from './models/Account'

@InputType()
export class CreateAccountInput {
  @Field()
  username: string

  @Field()
  @IsEmail()
  email: string

  @Field()
  @MinLength(ACCOUNT_PWD_MIN)
  password: string

  @Field((_type) => [String])
  @ArrayNotEmpty()
  roles: string[]

  /** Overrides default PENDING status on creation */
  status?: AccountStatus

  /** Referrals to another accountId who creates the new account */
  createdByAccountId?: string

  orgId: string
}
