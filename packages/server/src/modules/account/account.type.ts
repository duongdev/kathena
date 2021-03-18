import { Field, InputType, Int, ObjectType } from '@nestjs/graphql'
import { ArrayNotEmpty, IsEmail } from 'class-validator'

import { Account, AccountStatus } from './models/Account'

@InputType()
export class CreateAccountInput {
  @Field()
  username: string

  @Field()
  @IsEmail()
  email: string

  @Field({ nullable: true })
  displayName?: string

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

@ObjectType()
export class OrgAccountsPayload {
  @Field((_type) => [Account])
  accounts: Account[]

  @Field((_type) => Int)
  totalCount: number
}
