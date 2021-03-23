import { Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'

@InputType()
export class CreateAcademicSubjectInput {
  @Field()
  @IsNotEmpty()
  name: string

  @Field({ defaultValue: '' })
  description: string
}
