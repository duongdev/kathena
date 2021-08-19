import { Field, ID, ObjectType } from '@nestjs/graphql'
import { prop } from '@typegoose/typegoose'

import { BaseModel, Publication } from 'core'

@ObjectType({ implements: [BaseModel] })
export class Lesson extends BaseModel {
  @Field((_type) => Date)
  @prop({ type: Date, required: true })
  startTime: Date

  @Field((_type) => Date)
  @prop({ type: Date, required: true })
  endTime: Date

  @Field({ nullable: true, defaultValue: null })
  @prop({ type: String })
  description: string

  @Field((_type) => [String], { defaultValue: [] })
  @prop({ type: [String], default: [] })
  absentStudentIds: string[]

  @Field({ defaultValue: null })
  @prop({ type: String, default: null })
  lecturerComment: string

  @Field((_type) => ID)
  @prop({ required: true })
  courseId: string

  @Field((_type) => ID)
  @prop({ required: true })
  orgId: string

  @Field((_type) => Publication)
  @prop({ required: true, default: Publication.Draft })
  publicationState: Publication

  @Field()
  @prop({ type: Number, default: 0 })
  avgNumberOfStars: number
}
