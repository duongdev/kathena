import {
  Field,
  InputType,
  ID,
  registerEnumType,
  Int,
  ObjectType,
} from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'

import { Publication } from 'core'

import { Lesson } from './models/Lesson'

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

  @Field((_type) => Publication, { defaultValue: Publication.Draft })
  publicationState: Publication
}

export enum LessonsFilterInputStatus {
  academic = 0,
  studying = 1,
  teaching = 2,
}
registerEnumType(LessonsFilterInputStatus, {
  name: 'LessonsFilterInputStatus',
})

@InputType()
export class LessonsFilterInput {
  @Field((_type) => ID)
  courseId: string

  @Field((_type) => Date, { nullable: true, defaultValue: null })
  startTime?: Date

  @Field((_type) => Date, { nullable: true, defaultValue: null })
  endTime?: Date

  @Field((_type) => ID, { nullable: true, defaultValue: null })
  absentStudentId?: string

  @Field((_type) => Number, { nullable: true, defaultValue: null })
  ratingStar?: number

  @Field((_type) => LessonsFilterInputStatus, {
    nullable: false,
  })
  status: LessonsFilterInputStatus
}

@ObjectType()
export class LessonsPayload {
  @Field((_type) => [Lesson])
  lessons: Lesson[]

  @Field((_type) => Int)
  count: number
}

export enum UpdateLessonTimeOptions {
  DoNotChangeTheOrderOfTheLessons = 'DoNotChangeTheOrderOfTheLessons',
  ArbitraryChange = 'ArbitraryChange',
}
registerEnumType(UpdateLessonTimeOptions, {
  name: 'UpdateLessonTimeOptions',
})

@InputType()
export class UpdateLessonInput {
  @Field((_type) => UpdateLessonTimeOptions, {
    defaultValue: UpdateLessonTimeOptions.ArbitraryChange,
  })
  options?: UpdateLessonTimeOptions

  @Field((_type) => Number, { nullable: true, defaultValue: 0 })
  numberOfLessonsPostponed?: number

  @Field((_type) => Date, { nullable: true })
  startTime?: Date

  @Field((_type) => Date, { nullable: true })
  endTime?: Date

  @Field({ nullable: true })
  description?: string

  @Field((_type) => [String], { nullable: true })
  absentStudentIds?: string[]

  @Field((_type) => Publication, { nullable: true })
  publicationState?: Publication

  @Field((_type) => [String], { nullable: true })
  classworkMaterialListBeforeClass?: string[]

  @Field((_type) => [String], { nullable: true })
  classworkMaterialListInClass?: string[]

  @Field((_type) => [String], { nullable: true })
  classworkMaterialListAfterClass?: string[]

  @Field((_type) => [String], { nullable: true })
  classworkAssignmentListBeforeClass?: string[]

  @Field((_type) => [String], { nullable: true })
  classworkAssignmentListInClass?: string[]

  @Field((_type) => [String], { nullable: true })
  classworkAssignmentListAfterClass?: string[]

  @Field((_type) => [String], { nullable: true })
  quizListBeforeClass?: string[]

  @Field((_type) => [String], { nullable: true })
  quizListInClass?: string[]

  @Field((_type) => [String], { nullable: true })
  quizListAfterClass?: string[]
}

@InputType()
export class CommentsForTheLessonByLecturerQuery {
  @Field((_type) => ID)
  @IsNotEmpty({ message: 'Lesson Id can not be empty' })
  lessonId: string

  @Field((_type) => ID)
  @IsNotEmpty({ message: 'Course Id can not be empty' })
  courseId: string
}

@InputType()
export class CommentsForTheLessonByLecturerInput {
  @Field((_type) => String, { nullable: true })
  comment: string
}

@InputType()
export class UpdateLessonPublicationByIdInput {
  @Field((_type) => ID)
  @IsNotEmpty({ message: 'Lesson Id can not be empty' })
  lessonId: string

  @Field((_type) => Publication)
  publicationState: Publication

  @Field((_type) => ID)
  courseId: string
}

export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}
registerEnumType(DayOfWeek, {
  name: 'DayOfWeek',
})
@InputType()
export class DayOfTheWeekInput {
  @Field((_type) => DayOfWeek)
  @IsNotEmpty({ message: 'index can not be empty' })
  dayOfWeek: DayOfWeek

  @Field((_type) => String)
  @IsNotEmpty({ message: 'startTime can not be empty' })
  startTime: string

  @Field((_type) => String)
  @IsNotEmpty({ message: 'endTime can not be empty' })
  endTime: string
}

@InputType()
export class GenerateLessonsInput {
  @Field((_type) => Date)
  @IsNotEmpty({ message: 'courseStartDate can not be empty' })
  courseStartDate: Date

  @Field((_type) => Number)
  @IsNotEmpty({ message: 'totalNumberOfLessons can not be empty' })
  totalNumberOfLessons: number

  // min = 0, max = 6
  // There is no binding solution so I have to comment
  @Field((_type) => [DayOfTheWeekInput])
  @IsNotEmpty({ message: 'listOfLessonsForAWeek can not be empty' })
  daysOfTheWeek: DayOfTheWeekInput[]
}

@ObjectType()
export class ListLessons {
  @Field((_type) => [Lesson])
  lessons: Lesson[]

  @Field((_type) => Int)
  count: number
}

@ObjectType()
export class GenerateArrayDateTimeOfTheLessonsOutput {
  @Field((_type) => Date)
  startTime: Date

  @Field((_type) => Date)
  endTime: Date
}
