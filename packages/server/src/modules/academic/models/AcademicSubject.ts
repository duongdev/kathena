import { Field, ObjectType } from '@nestjs/graphql'
import { index, prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

import { BaseModel, PublicationState } from 'core'
import { normalizeCodeField, removeExtraSpaces } from 'core/utils/string'

@index({ code: 1, orgId: 1 }, { unique: true })
@index({ name: 1, orgId: 1 })
@index({ publicationState: 1, orgId: 1 })
@ObjectType({ implements: [BaseModel] })
export class AcademicSubject extends BaseModel {
  @Field()
  @prop({ required: true, trim: true, set: removeExtraSpaces })
  name: string

  @Field()
  @prop({
    required: true,
    trim: true,
    set: normalizeCodeField,
  })
  code: string

  @Field({ defaultValue: '' })
  @prop({ required: true, set: removeExtraSpaces })
  description: string

  @Field((_type) => PublicationState)
  @prop({ required: true, index: true, default: PublicationState.Draft })
  publicationState: PublicationState

  @prop({ type: Types.ObjectId })
  createdByAccountId: string
}
