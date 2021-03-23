import { Field, ObjectType } from '@nestjs/graphql'
import { prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

import { BaseModel } from 'core'

@ObjectType({ implements: [BaseModel] })
export class AcademicSubject extends BaseModel {
  @Field()
  @prop({ required: true, trim: true })
  name: string

  @Field({ defaultValue: '' })
  @prop({ required: true })
  description: string

  @prop({ type: Types.ObjectId })
  createdByAccountId: string
}
