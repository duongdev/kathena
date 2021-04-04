import { Field, ObjectType } from '@nestjs/graphql'
import { index, prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

import { BaseModel, Publication } from 'core'

@index({ code: 1, orgId: 1 }, { unique: true })
@index({ name: 1, orgId: 1 })
@index({ publication: 1, orgId: 1 })
@ObjectType({ implements: [BaseModel] })
export class AcademicSubject extends BaseModel {
  @Field()
  @prop({ required: true, trim: true })
  name: string

  @Field()
  @prop({ required: true, trim: true })
  code: string

  @Field({ defaultValue: '' })
  @prop({ required: true })
  description: string

  @Field((_type) => Publication)
  @prop({ required: true, index: true, default: Publication.Draft })
  publication: Publication

  @prop({ type: Types.ObjectId })
  createdByAccountId: string

  @Field()
  @prop({ type: Types.ObjectId })
  imageFileId: string
}
