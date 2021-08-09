import { Field, InputType, ID } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'

@InputType()
export class RatingInput {
  @Field((_type) => ID)
  @IsNotEmpty({ message: 'TargetId is not empty' })
  targetId: string

  @Field((_type) => Number, { defaultValue: 1 })
  @IsNotEmpty({ message: 'Number of stars is not empty' })
  numberOfStars: number
}
