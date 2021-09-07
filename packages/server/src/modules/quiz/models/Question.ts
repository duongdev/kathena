import { Field, ID, ObjectType } from '@nestjs/graphql'
import { prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

import { BaseModel } from 'core'

@ObjectType({ implements: [BaseModel] })
export class Question extends BaseModel {
  @Field()
  @prop({ required: true, trim: true })
  title: string

  @Field()
  @prop({ default: 0 })
  scores: number

  @Field((_type) => ID)
  @prop({ type: Types.ObjectId })
  createdByAccountId: string
}
