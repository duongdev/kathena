import { Field, InputType, ID, Int, ObjectType } from '@nestjs/graphql'
import { IsNotEmpty, IsOptional } from 'class-validator'

import { Conversation } from 'modules/conversation/model/Conversation'

@InputType()
export class ConversationPageOptionInput {
  @Field((_type) => Int)
  limit: number
}

@ObjectType()
export class ConversationsPayload {
  @Field((_type) => [Conversation])
  conversations: Conversation[]

  @Field((_type) => Int)
  count: number
}

@InputType()
export class CreateConversationInput {
  @Field((_type) => ID)
  @IsNotEmpty({ message: 'CreatedByAccountId is not empty' })
  createdByAccountId: string

  @Field((_type) => ID)
  @IsNotEmpty({ message: 'RoomId is not empty' })
  roomId: string

  @Field()
  @IsNotEmpty({ message: 'Content is not empty' })
  content: string

  @Field({ nullable: true })
  @IsOptional()
  type?: string
}
