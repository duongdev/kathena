import { Field, ObjectType, registerEnumType } from '@nestjs/graphql'
import { prop } from '@typegoose/typegoose'
// import { Types } from 'mongoose'

import { BaseModel, Publication } from 'core'

export enum ClassworkType {
  Material = 'Material',
  Assignment = 'Assignment',
}

registerEnumType(ClassworkType, {
  name: 'ClassworkType',
  description: 'Type of a classwork',
})

@ObjectType({ implements: [BaseModel] })
export class ClassworkMaterial extends BaseModel {
  @Field()
  @prop({ required: true })
  courseId: string

  @Field()
  @prop({ required: true })
  title: string

  @Field()
  @prop({ required: true })
  type: string

  @Field({ nullable: true })
  description?: string

  @Field((_type) => [String])
  @prop({ type: [Types.ObjectId] })
  attachments?: string[]

  @Field()
  @prop({ required: true, index: true, default: Publication.Draft })
  publicationState: string
}
