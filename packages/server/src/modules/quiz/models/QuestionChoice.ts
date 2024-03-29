import { Field, ID, ObjectType } from '@nestjs/graphql'
import { prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

import { BaseModel } from 'core'

@ObjectType({ implements: [BaseModel] })
export class QuestionChoice extends BaseModel {
  @Field()
  @prop({ required: true, trim: true })
  title: string

  @Field((_type) => ID)
  @prop({ type: Types.ObjectId, required: true, index: true })
  questionId: string

  @Field()
  @prop({ required: true })
  isRight: boolean

  @Field((_type) => ID)
  @prop({ type: Types.ObjectId })
  createdByAccountId: string
}
