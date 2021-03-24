import { Field, ObjectType } from '@nestjs/graphql'
import { index, prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

import {
  BaseModel,
  PublicationState,
  normalizeCodeField,
  removeExtraSpaces,
  returnUnchanged,
} from 'core'

@index({ code: 1, orgId: 1 }, { unique: true })
@index({ name: 1, orgId: 1 })
@index({ publicationState: 1, orgId: 1 })
@ObjectType({ implements: [BaseModel] })
export class AcademicSubject extends BaseModel {
  @Field()
  @prop({
    required: true,
    trim: true,
    set: removeExtraSpaces,
    get: returnUnchanged,
  })
  name: string

  @Field()
  @prop({
    required: true,
    trim: true,
    set: normalizeCodeField,
    get: returnUnchanged,
  })
  code: string

  @Field({ defaultValue: '' })
  @prop({ required: true, set: removeExtraSpaces, get: returnUnchanged })
  description: string

  @Field((_type) => PublicationState)
  @prop({ required: true, index: true, default: PublicationState.Draft })
  publicationState: PublicationState

  @prop({ type: Types.ObjectId })
  createdByAccountId: string
}
