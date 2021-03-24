import { Field, Float, ObjectType } from '@nestjs/graphql'
import { index, prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

import { BaseModel, PublicationState } from 'core'
import { normalizeCodeField, removeExtraSpaces } from 'core/utils/string'

@index({ code: 1, orgId: 1 }, { unique: true })
@index({ publicationState: 1, orgId: 1 })
@index({ name: 1, orgId: 1 }, { unique: true })
@ObjectType({ implements: [BaseModel] })
export class Course extends BaseModel {
  @Field()
  @prop({ required: true, trim: true, index: true, set: normalizeCodeField })
  code: string

  @Field()
  @prop({ required: true, trim: true, set: removeExtraSpaces })
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
