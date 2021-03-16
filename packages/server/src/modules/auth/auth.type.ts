import { Field, ObjectType } from '@nestjs/graphql'

import { Account } from 'modules/account/models/Account'
import { Org } from 'modules/org/models/Org'

import { Permission } from './models'

export type AuthData = {
  accountId: string
  orgId: string
}

@ObjectType()
export class AuthenticatePayload {
  @Field((_type) => Account)
  account: Account

  @Field((_type) => Org)
  org: Org

  @Field((_type) => [Permission])
  permissions: Permission[]
}

@ObjectType()
export class SignInPayload {
  @Field()
  token: string

  @Field((_type) => Account)
  account: Account

  @Field((_type) => Org)
  org: Org

  @Field((_type) => [Permission])
  permissions: Permission[]
}
