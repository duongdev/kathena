import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql'
import { prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

import { BaseModel, Publication } from 'core'

export enum ClassworkType {
  Material = 'Material',
  Assignment = 'Assignment',
}

registerEnumType(ClassworkType, {
  name: 'ClassworkType',
  description: 'Type of a classwork',
})

@ObjectType()
export class IframeVideo {
  @Field()
  @prop({ required: true })
  title: string

  @Field()
  @prop({ type: Types.ObjectId })
  thumbnail: string

  @Field()
  @prop({ required: true })
  iframe: string
}

@ObjectType({ implements: [BaseModel] })
export class Classwork extends BaseModel {
  @Field((_type) => ID)
  @prop({ required: true, type: Types.ObjectId })
  createdByAccountId: string

  @Field((_type) => ID)
  @prop({ required: true, type: Types.ObjectId })
  courseId: string

  @Field()
  @prop({ required: true })
  title: string

  @Field()
  @prop({ required: true })
  type: string

  @Field({ nullable: true })
  @prop({ required: false })
  description?: string

  @Field((_type) => [String])
  @prop({ type: [Types.ObjectId] })
  attachments?: string[]

  @Field((_type) => [IframeVideo])
  @prop({ type: [IframeVideo] })
  iframeVideos?: IframeVideo[]

  @Field((_type) => Publication)
  @prop({ required: true, index: true, default: Publication.Draft })
  publicationState: Publication
}
