import { Field, ID, ObjectType } from '@nestjs/graphql'
import { prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

import { BaseModel } from 'core'

@ObjectType({ implements: [BaseModel] })
export class Rating extends BaseModel {
  @Field()
  @prop({ required: true, type: Types.ObjectId })
  createdByAccountId: string

  @Field((_type) => ID)
  @prop({ required: true })
  targetId: string

  @Field((_type) => ID)
  @prop({ required: true })
  orgId: string

  @Field((_type) => Number, { defaultValue: 1 })
  @prop({ required: true, min: 1, max: 5 })
  numberOfStars: number
}
