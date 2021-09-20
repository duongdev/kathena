import { Field, Float, ID, ObjectType } from '@nestjs/graphql'
import { index, prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

import {
  BaseModel,
  Publication,
  normalizeCodeField,
  removeExtraSpaces,
} from 'core'
import { DayOfWeek } from 'modules/lesson/lesson.type'

@ObjectType()
class DayOfTheWeek {
  @Field((_type) => DayOfWeek)
  @prop({ require: true })
  dayOfWeek: DayOfWeek

  @Field((_type) => String)
  @prop({ require: true })
  startTime: string

  @Field((_type) => String)
  @prop({ require: true })
  endTime: string
}

@index({ code: 1, orgId: 1 }, { unique: true })
@index({ name: 1, orgId: 1 })
@index({ academicSubjectId: 1, orgId: 1 })
@index({ publicationState: 1, orgId: 1 })
@index({ code: 'text' })
@index({ name: 'text' })
@ObjectType({ implements: [BaseModel] })
export class Course extends BaseModel {
  @Field((_type) => ID)
  @prop({ type: Types.ObjectId, required: true, index: true })
  academicSubjectId: string

  @Field((_type) => ID)
  @prop({ type: Types.ObjectId, required: true, index: true })
  orgOfficeId: string

  @Field()
  @prop({
    required: true,
    trim: true,
    index: true,
    set: (code: string) => normalizeCodeField(code),
    get: (code: string) => code,
  })
  code: string

  @Field()
  @prop({
    required: true,
    trim: true,
    set: (name: string) => removeExtraSpaces(name),
    get: (code: string) => code,
  })
  name: string

  @Field((_type) => Date)
  @prop({ type: Date, required: true })
  startDate: Date

  @Field((_type) => Float)
  @prop({ required: true, min: 0 })
  tuitionFee: number

  @Field((_type) => Publication)
  @prop({ required: true, index: true, default: Publication.Draft })
  publicationState: Publication

  @Field((_type) => Date)
  @prop({ required: false, type: Date })
  publishedAt?: Date | null

  @Field((_type) => [ID])
  @prop({ type: [Types.ObjectId], default: [] })
  lecturerIds: string[]

  @Field((_type) => [ID])
  @prop({ type: [Types.ObjectId], default: [] })
  studentIds: string[]

  @Field((_type) => Number)
  @prop({ require: true, min: 0 })
  totalNumberOfLessons: number

  @Field((_type) => [DayOfTheWeek])
  @prop({ type: [DayOfTheWeek], required: true, default: [] })
  listOfLessonsForAWeek: DayOfTheWeek[]

  @Field((_type) => ID)
  @prop({ type: Types.ObjectId, required: true })
  createdByAccountId: string
}
