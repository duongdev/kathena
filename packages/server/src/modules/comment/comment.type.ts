import { Field, InputType, ID, Int, ObjectType } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'

import { Comment } from 'modules/comment/model/Comment'

@InputType()
export class CommentPageOptionInput {
  @Field((_type) => Int)
  limit: number
}

@ObjectType()
export class CommentsPayload {
  @Field((_type) => [Comment])
  comments: Comment[]

  @Field((_type) => Int)
  count: number
}

@InputType()
export class CreateCommentInput {
  @Field((_type) => ID)
  @IsNotEmpty({ message: 'CreatedByAccountId is not empty' })
  createdByAccountId: string

  @Field((_type) => ID)
  @IsNotEmpty({ message: 'TargetId is not empty' })
  targetId: string

  @Field()
  @IsNotEmpty({ message: 'Content is not empty' })
  content: string
}
