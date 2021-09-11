import { Field, ID, ObjectType } from '@nestjs/graphql'
import { prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

import { BaseModel, Publication } from 'core'

@ObjectType({ implements: [BaseModel] })
export class Quiz extends BaseModel {
  @Field()
  @prop({ required: true, trim: true })
  title: string

  @Field({ nullable: true })
  @prop({ trim: true })
  description?: string

  @Field((_type) => ID)
  @prop({ type: Types.ObjectId, required: true, index: true })
  courseId: string

  @Field((_type) => [ID])
  @prop({ type: [Types.ObjectId], default: [] })
  questionIds: string[]

  @Field((_type) => Number, { nullable: true })
  @prop({ default: null })
  duration?: number

  @Field((_type) => ID)
  @prop({ type: Types.ObjectId })
  createdByAccountId: string

  @Field((_type) => Publication)
  @prop({ required: true, index: true, default: Publication.Draft })
  publicationState: Publication
}
