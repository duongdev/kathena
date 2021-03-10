import { Field, ObjectType } from '@nestjs/graphql'

import { Account } from 'modules/account/models/Account'
import { Org } from 'modules/org/models/Org'

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
}
