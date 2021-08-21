import { Field, ObjectType, ID, registerEnumType } from '@nestjs/graphql'
import { prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

import { BaseModel } from 'core'

export enum ConversationType {
  Group = 'Group',
  Single = 'Single',
}

registerEnumType(ConversationType, {
  name: 'ConversationType',
  description: 'Type of an conversation.',
})

@ObjectType({ implements: [BaseModel] })
export class Conversation extends BaseModel {
  @Field((_type) => ID)
  @prop({ required: true, type: Types.ObjectId })
  createdByAccountId: string

  @Field((_type) => ID)
  @prop({ required: true, type: Types.ObjectId })
  roomId: string

  @Field()
  @prop({ required: true })
  content: string

  @Field((_type) => ConversationType)
  @prop({
    enum: ConversationType,
    type: String,
    index: true,
    default: ConversationType.Group,
  })
  type: ConversationType
}
