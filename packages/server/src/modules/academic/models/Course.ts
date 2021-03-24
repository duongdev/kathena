import { Field, Float, ID, ObjectType } from '@nestjs/graphql'
import { index, prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

import {
  BaseModel,
  PublicationState,
  returnUnchanged,
  normalizeCodeField,
  removeExtraSpaces,
} from 'core'

@index({ code: 1, orgId: 1 }, { unique: true })
@index({ name: 1, orgId: 1 })
@index({ academicSubjectId: 1, orgId: 1 })
@index({ publicationState: 1, orgId: 1 })
@ObjectType({ implements: [BaseModel] })
export class Course extends BaseModel {
  @Field((_type) => ID)
  @prop({ type: Types.ObjectId, required: true, index: true })
  academicSubjectId: string

  @Field()
  @prop({
    required: true,
    trim: true,
    index: true,
    set: normalizeCodeField,
    get: returnUnchanged,
  })
  code: string

  @Field()
  @prop({
    required: true,
    trim: true,
    set: removeExtraSpaces,
    get: returnUnchanged,
  })
  name: string

  @Field((_type) => Date)
  @prop({ type: Date, required: true })
  startDate: Date

  @Field((_type) => Float)
  @prop({ required: true, min: 0 })
  tuitionFee: number

  @Field((_type) => PublicationState)
  @prop({ required: true, index: true, default: PublicationState.Draft })
  publicationState: PublicationState

  @Field((_type) => Date)
  @prop({ required: false.valueOf, type: Date })
  publishedAt?: Date | null

  @Field()
  lecturerIds: string[]

  @prop({ type: Types.ObjectId, required: true })
  createdByAccountId: string
}
