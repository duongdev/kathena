import { Field, InputType } from '@nestjs/graphql'
import { ArrayNotEmpty, IsEmail } from 'class-validator'

import { AccountStatus } from './models/Account'

@InputType()
export class CreateAccountInput {
  @Field()
  username: string

  @Field()
  @IsEmail()
  email: string

  @Field()
  displayName: string

  @Field((_type) => [String])
  @ArrayNotEmpty()
  roles: string[]
}

export class CreateAccountServiceInput extends CreateAccountInput {
  orgId: string

  password?: string

  status?: AccountStatus

  createdByAccountId?: string
}
