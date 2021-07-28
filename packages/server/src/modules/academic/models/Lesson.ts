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

  @Field()
  @prop({ type: String, required: false, nullable: true })
  description: string

  @Field((_type) => [String])
  @prop({ type: [String], default: [] })
  absentStudentIds: string[]

  @Field()
  @prop({ type: String, required: true })
  ratingOfLecturer: string

  @Field((_type) => ID)
  @prop({ required: true })
  courseId: string

  @Field((_type) => Publication)
  @prop({ required: true, index: true, default: Publication.Draft })
  publicationState: Publication
}
