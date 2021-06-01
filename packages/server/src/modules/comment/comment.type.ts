import { Field, InputType, Int, ObjectType } from '@nestjs/graphql'

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
