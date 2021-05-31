import { Field, ID, ObjectType } from '@nestjs/graphql'
import { prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

import { BaseModel } from 'core'

@ObjectType({ implements: [BaseModel] })
export class ClassworkSubmission extends BaseModel {
  @Field()
  @prop({ required: true, type: Types.ObjectId })
  createdByAccountId: string

  @Field((_type) => ID)
  @prop({ required: true })
  classworkId: string

  @Field()
  @prop({ required: true, default: 0 })
  grade: number
}
