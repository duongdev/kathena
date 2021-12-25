import { Field, ID, ObjectType } from '@nestjs/graphql'
import { prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

import { BaseModel } from 'core'

export enum ClassworkSubmissionStatus {
  Submitted = 'Submitted',
  OnTime = 'OnTime',
  Late = 'Late',
  DoNotSubmit = 'DoNotSubmit',
}

@ObjectType({ implements: [BaseModel] })
export class ClassworkSubmission extends BaseModel {
  @Field((_type) => ID)
  @prop({ required: true, type: Types.ObjectId })
  createdByAccountId: string

  @Field((_type) => ID)
  @prop({ required: true, type: Types.ObjectId })
  classworkId: string

  @Field((_type) => ID)
  @prop({ required: true, type: Types.ObjectId })
  courseId: string

  @Field((_type) => Number, { nullable: true })
  @prop({ default: null, min: 0, max: 100 })
  grade: number

  @Field((_type) => [ID], { defaultValue: [] })
  @prop({ type: [Types.ObjectId], default: [] })
  submissionFileIds?: string[]

  @Field()
  @prop({ default: '' })
  description?: string
}
