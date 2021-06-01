import { Field, ID, InputType } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'

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
