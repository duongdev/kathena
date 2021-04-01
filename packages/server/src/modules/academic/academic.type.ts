import { Field, InputType, Int, ObjectType } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'
import { FileUpload, GraphQLUpload } from 'graphql-upload'

import { AcademicSubject } from './models/AcademicSubject'

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

  @Field((_type) => GraphQLUpload)
  image: Promise<FileUpload>
}
@ObjectType()
export class AcademicSubjectsPayload {
  @Field((_type) => [AcademicSubject])
  academicsSubject: AcademicSubject[]

  @Field((_type) => Int)
  count: number
}
