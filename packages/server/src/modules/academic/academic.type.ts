import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql'
import { IsNotEmpty, IsOptional } from 'class-validator'
import { FileUpload, GraphQLUpload } from 'graphql-upload'

import { Publication } from 'core'

import { AcademicSubject } from './models/AcademicSubject'
import { Course } from './models/Course'
import { Lesson } from './models/Lesson'

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

@InputType()
export class CreateCourseInput {
  @Field()
  @IsNotEmpty({ message: 'Academic subject id cannot be empty' })
  academicSubjectId: string

  @Field()
  @IsNotEmpty({ message: 'OrgOffice id cannot be empty' })
  orgOfficeId: string

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

@InputType()
export class CreateLessonInput {
  @Field((_type) => Date)
  @IsNotEmpty({ message: 'Start time cannot be empty' })
  startTime: Date

  @Field((_type) => Date)
  @IsNotEmpty({ message: 'End time cannot be empty' })
  endTime: Date

  @Field({ nullable: true })
  description: string

  @Field()
  @IsNotEmpty({ message: 'CourseId can not be empty' })
  courseId: string

  @Field((_type) => Publication)
  publicationState: Publication
}

@InputType()
export class LessonsFilterInput {
  @Field((_type) => ID)
  orgId: string

  @Field((_type) => ID)
  courseId: string

  @Field((_type) => Date, { nullable: true, defaultValue: null })
  startTime?: Date

  @Field((_type) => Date, { nullable: true, defaultValue: null })
  endTime?: Date

  @Field((_type) => ID, { nullable: true, defaultValue: null })
  absentStudentId?: string
}

@ObjectType()
export class LessonsPayload {
  @Field((_type) => [Lesson])
  lessons: Lesson[]

  @Field((_type) => Int)
  count: number
}

@InputType()
export class UpdateLessonInput {
  @Field((_type) => Date, { nullable: true })
  startTime?: Date

  @Field((_type) => Date, { nullable: true })
  endTime?: Date

  @Field({ nullable: true })
  description?: string

  @Field((_type) => Publication, { nullable: true })
  publicationState?: Publication
}
