import { Field, InputType, ID, Int, ObjectType } from '@nestjs/graphql'
import { IsNotEmpty, IsOptional, Min } from 'class-validator'

import { DayOfTheWeekInput } from 'modules/lesson/lesson.type'

import { Course } from './models/Course'

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

  @Field((_type) => Date)
  @IsNotEmpty({ message: 'Start date cannot be empty' })
  startDate: Date

  @Field()
  @IsNotEmpty({ message: 'Tuition fee cannot be empty' })
  tuitionFee: number

  @Field((_type) => [String], { defaultValue: [] })
  lecturerIds?: string[]

  @Field((_type) => [DayOfTheWeekInput], { defaultValue: [] })
  daysOfTheWeek: DayOfTheWeekInput[]

  @Field()
  @IsNotEmpty({ message: 'Total number of lessons cannot be empty' })
  totalNumberOfLessons: number
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
  startDate?: Date

  @Field((_type) => [ID], { nullable: true })
  @IsOptional()
  lecturerIds?: string[]

  @Field((_type) => [DayOfTheWeekInput], { nullable: true })
  @IsOptional()
  daysOfTheWeek?: DayOfTheWeekInput[]
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
export class CloneCourseInput {
  @Field((_Type) => ID)
  @IsNotEmpty({ message: 'courseIdMustCopy id cannot be empty' })
  courseIdMustCopy: string

  @Field()
  @IsNotEmpty({ message: 'OrgOffice id cannot be empty' })
  orgOfficeId: string

  @Field()
  @IsNotEmpty({ message: 'Code cannot be empty' })
  code: string

  @Field()
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name: string

  @Field((_type) => Date)
  @IsNotEmpty({ message: 'Start date cannot be empty' })
  startDate: Date

  @Field((_type) => Number, { nullable: true })
  @Min(0)
  tuitionFee?: number

  @Field((_type) => [String], { nullable: true })
  lecturerIds?: string[]

  @Field((_type) => [DayOfTheWeekInput], { nullable: true })
  daysOfTheWeek?: DayOfTheWeekInput[]
}
