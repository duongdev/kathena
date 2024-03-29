import { Field, ID, ObjectType } from '@nestjs/graphql'
import { prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

import { BaseModel, Publication } from 'core'

@ObjectType({ implements: [BaseModel] })
export class Lesson extends BaseModel {
  @Field((_type) => ID)
  @prop({ type: Types.ObjectId, required: true })
  createdByAccountId: string

  @Field((_type) => ID)
  @prop({ type: Types.ObjectId, required: true })
  updatedByAccountId: string

  @Field((_type) => Date)
  @prop({ type: Date, required: true })
  startTime: Date

  @Field((_type) => Date)
  @prop({ type: Date, required: true })
  endTime: Date

  @Field({ nullable: true, defaultValue: null })
  @prop({ type: String })
  description: string

  @Field((_type) => [ID], { defaultValue: [] })
  @prop({ type: [Types.ObjectId], default: [] })
  absentStudentIds: string[]

  @Field({ defaultValue: null, nullable: true })
  @prop({ type: String, default: null })
  lecturerComment: string

  @Field((_type) => ID)
  @prop({ type: Types.ObjectId, required: true })
  courseId: string

  @Field((_type) => ID)
  @prop({ type: Types.ObjectId, required: true })
  orgId: string

  @Field((_type) => Publication)
  @prop({ required: true, default: Publication.Draft })
  publicationState: Publication

  @Field({ defaultValue: 0 })
  @prop({ type: Number, default: 0 })
  avgNumberOfStars: number

  @Field((_type) => [ID], { nullable: true })
  @prop({ type: [Types.ObjectId], required: false, default: [] })
  classworkMaterialListBeforeClass: string[]

  @Field((_type) => [ID], { nullable: true })
  @prop({ type: [Types.ObjectId], required: false, default: [] })
  classworkMaterialListInClass: string[]

  @Field((_type) => [ID], { nullable: true })
  @prop({ type: [Types.ObjectId], required: false, default: [] })
  classworkMaterialListAfterClass: string[]

  @Field((_type) => [ID], { nullable: true })
  @prop({ type: [Types.ObjectId], required: false, default: [] })
  classworkAssignmentListBeforeClass: string[]

  @Field((_type) => [ID], { nullable: true })
  @prop({ type: [Types.ObjectId], required: false, default: [] })
  classworkAssignmentListInClass: string[]

  @Field((_type) => [ID], { nullable: true })
  @prop({ type: [Types.ObjectId], required: false, default: [] })
  classworkAssignmentListAfterClass: string[]

  @Field((_type) => [ID], { nullable: true })
  @prop({ type: [Types.ObjectId], required: false, default: [] })
  quizListBeforeClass: string[]

  @Field((_type) => [ID], { nullable: true })
  @prop({ type: [Types.ObjectId], required: false, default: [] })
  quizListInClass: string[]

  @Field((_type) => [ID], { nullable: true })
  @prop({ type: [Types.ObjectId], required: false, default: [] })
  quizListAfterClass: string[]
}
