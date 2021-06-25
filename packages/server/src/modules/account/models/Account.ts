import { Field, ObjectType, registerEnumType } from '@nestjs/graphql'
import { index, prop } from '@typegoose/typegoose'
import { isEmail } from 'class-validator'
import { Types } from 'mongoose'

import { BaseModel } from 'core'
import { OrgRoleName } from 'modules/auth/models/Role'

export enum AccountStatus {
  Pending = 'Pending',
  Active = 'Active',
  Deactivated = 'Deactivated',
}

registerEnumType(AccountStatus, {
  name: 'AccountStatus',
  description: 'Status of an account.',
})

export enum AccountAvailability {
  Online = 'Online',
  Offline = 'Offline',
  Away = 'Away',
}

registerEnumType(AccountAvailability, { name: 'AccountAvailability' })

@index({ username: 1, orgId: 1 }, { unique: true })
@index({ email: 1, orgId: 1 }, { unique: true })
@index({ displayName: 'text' })
@ObjectType({ implements: [BaseModel] })
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
  @prop({ required: true, index: true, trim: true, validate: isEmail })
  email: string

  @Field({ nullable: true })
  @prop({ trim: true })
  displayName?: string

  @prop({ required: true })
  password: string

  @prop({ nullable: true })
  otp: string

  @prop({ nullable: true })
  otpExpired: Date

  @Field((_type) => AccountStatus)
  @prop({
    enum: AccountStatus,
    type: String,
    index: true,
    default: AccountStatus.Pending,
  })
  status: AccountStatus

  @Field((_type) => [String], { defaultValue: [] })
  @prop({ type: [String], default: [] })
  roles: OrgRoleName[]

  @prop({ required: false, type: Date, default: null })
  lastActivityAt: Date | null

  @prop({ type: Types.ObjectId })
  createdByAccountId?: string
}
