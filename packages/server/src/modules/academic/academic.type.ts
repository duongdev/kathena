import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql'
import { IsNotEmpty, IsOptional } from 'class-validator'
import { FileUpload, GraphQLUpload } from 'graphql-upload'

import { AcademicSubject } from './models/AcademicSubject'
import { Course } from './models/Course'

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

@InputType()
export class CreateCourseInput {
  @Field()
  @IsNotEmpty({ message: 'Academic subject id cannot be empty' })
  academicSubjectId: string

  @Field()
  @IsNotEmpty({ message: 'Code cannot be empty' })
  code: string

  @Field()
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name: string

  @Field()
  @IsNotEmpty({ message: 'Start date cannot be empty' })
  startDate: string

  @Field()
  @IsNotEmpty({ message: 'Tuition fee cannot be empty' })
  tuitionFee: number

  @Field((_type) => [String], { defaultValue: [] })
  lecturerIds?: string[]
}

@InputType()
export class UpdateCourseInput {
  @Field({ nullable: true })
  @IsOptional()
  name?: string

  @Field({ nullable: true })
  @IsOptional()
  tuitionFee?: number

  @Field({ nullable: true })
  @IsOptional()
  startDate?: string

  @Field((_type) => [ID], { nullable: true })
  @IsOptional()
  lecturerIds?: string[]
}

@ObjectType()
export class CoursesPayload {
  @Field((_type) => [Course])
  courses: Course[]

  @Field((_type) => Int)
  count: number
}
@InputType()
export class CoursesFilterInput {
  @Field((_type) => ID)
  orgId: string

  @Field({ nullable: true })
  searchText: string

  @Field((_type) => [ID], { nullable: true })
  lecturerIds: string[]

  @Field((_type) => [ID], { nullable: true })
  studentIds: string[]
}
