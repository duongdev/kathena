import { Field, ID, ObjectType } from '@nestjs/graphql'
import { prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

import { BaseModel } from 'core'

@ObjectType({ implements: [BaseModel] })
export class QuizSubmit extends BaseModel {
  @Field((_type) => ID)
  @prop({ type: Types.ObjectId, required: true, index: true })
  quizId: string

  @Field()
  @prop({ default: 0 })
  scores: number

  @Field((_type) => Date, { nullable: true })
  @prop({ type: Date, default: Date.now() })
  startTime: Date

  @Field((_type) => [String], { nullable: true })
  @prop({ type: [String], default: [] })
  questionIds: string[]

  @Field((_type) => [String], { nullable: true })
  @prop({ type: [String], default: [] })
  questionChoiceIds: string[]

  @Field((_type) => ID)
  @prop({ type: Types.ObjectId })
  createdByAccountId: string
}
