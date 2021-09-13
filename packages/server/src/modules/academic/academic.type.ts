import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql'
import { IsNotEmpty, IsOptional } from 'class-validator'
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

@InputType()
export class AcademicSubjectsFilterInput {
  @Field((_type) => ID)
  orgId: string

  @Field({ nullable: true })
  searchText: string
}

@ObjectType()
export class AcademicSubjectsPayload {
  @Field((_type) => [AcademicSubject])
  academicSubjects: AcademicSubject[]

  @Field((_type) => Int)
  count: number
}

@InputType()
export class UpdateAcademicSubjectInput {
  @Field({ nullable: true })
  @IsOptional()
  name?: string

  @Field({ nullable: true })
  @IsOptional()
  description?: string
}
