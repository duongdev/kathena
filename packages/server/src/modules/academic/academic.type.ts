import { Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'

@InputType()
export class CreateAcademicSubjectInput {
  @Field()
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name: string

  @Field()
  @IsNotEmpty({ message: 'Code cannot be empty' })
  code: string

  @Field({ defaultValue: '' })
  description: string
}
