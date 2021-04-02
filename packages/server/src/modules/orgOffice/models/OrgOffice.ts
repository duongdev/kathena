import { Field, ObjectType } from '@nestjs/graphql'
import { prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

import { BaseModel } from 'core'

@ObjectType({ implements: [BaseModel] })
export class OrgOffice extends BaseModel {
  @Field()
  @prop({ required: true })
  name: string

  @Field()
  @prop({ required: true })
  address: string

  @Field()
  @prop({ required: true })
  phone: string

  @prop({ type: Types.ObjectId })
  createdByAccountId: string
}
