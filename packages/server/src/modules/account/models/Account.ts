import { Field, ObjectType, registerEnumType } from '@nestjs/graphql'
import { prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

import { BaseModel } from 'core'

export enum AccountStatus {
  Pending = 'Pending',
  Active = 'Active',
  Deactivated = 'Deactivated',
}

registerEnumType(AccountStatus, {
  name: 'AccountStatus',
  description: 'Status of an account.',
})

@ObjectType({})
export class Account extends BaseModel {
  @Field()
  @prop({
    required: true,
    index: true,
    lowercase: true,
    trim: true,
  })
  username: string

  @Field()
  @prop({ required: true, index: true })
  email: string

  @prop({ required: true })
  password: string

  @Field(() => AccountStatus)
  @prop({
    enum: AccountStatus,
    type: String,
    index: true,
    default: AccountStatus.Pending,
  })
  status: AccountStatus

  @prop({ required: false, type: Date, default: null })
  lastActivityAt: Date | null

  @prop({ type: Types.ObjectId })
  createdBy?: string
}
