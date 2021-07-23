import { Field, ObjectType } from '@nestjs/graphql'
import { index, prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

import { BaseModel } from 'core'

@index({ name: 'text', address: 'text', phone: 'text' })
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
