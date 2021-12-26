import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql'
import { IsNotEmpty, IsOptional } from 'class-validator'

import { Publication } from 'core'

import { QuestionChoice } from './models/QuestionChoice'
import { Quiz } from './models/Quiz'
import { QuizSubmit } from './models/QuizSubmit'

@InputType()
export class CreateQuestionInput {
  @Field()
  @IsNotEmpty({ message: 'Title cannot be empty' })
  title: string

  @Field()
  scores: number

  @Field((_type) => [String])
  questionChoicesTitle: string[]

  @Field((_type) => [Boolean])
  questionChoicesRight: boolean[]
}
@InputType()
export class SubmitQuizInput {
  @Field()
  quizSubmitId: string

  @Field((_type) => [String])
  questionIds: string[]

  @Field((_type) => [String])
  questionChoiceIds: string[]
}

// @InputType()
// export class CreateQuestionChoiceInput {
//   @Field()
//   @IsNotEmpty({ message: 'Title cannot be empty' })
//   title: string

//   @Field()
//   @IsNotEmpty({ message: 'Question id cannot be empty' })
//   questionId: string

//   @Field()
//   @IsNotEmpty({ message: 'Is right cannot be empty' })
//   isRight: boolean

//   @Field()
//   description: string
// }

@InputType()
export class CreateQuizInput {
  @Field()
  @IsNotEmpty({ message: 'Title cannot be empty' })
  title: string

  @Field()
  @IsNotEmpty({ message: 'Course id cannot be empty' })
  courseId: string

  @Field((_type) => [String], { defaultValue: [] })
  questionIds?: string[]

  @Field({ nullable: true })
  duration?: number

  @Field()
  description: string

  @Field((_type) => Publication, { nullable: true })
  publicationState?: string

  @Field({ nullable: true })
  detailQuiz?: string

  @Field({ nullable: true })
  explainTheAnswer?: string

  @Field({ nullable: true })
  duDate?: Date
}
@InputType()
export class CreateQuizSubmitInput {
  @Field()
  @IsNotEmpty({ message: 'Quiz id cannot be empty' })
  quizId: string

  @Field()
  startTime: Date
}

@InputType()
export class QuizzesFilterInput {
  @Field((_type) => ID)
  courseId: string

  @Field((_type) => Publication, { nullable: true })
  @IsOptional()
  publicationState?: Publication
}

@ObjectType()
export class QuizzesPayload {
  @Field((_type) => [Quiz])
  quizzes: Quiz[]

  @Field((_type) => Int)
  count: number
}

@InputType()
export class QuizSubmitsFilterInput {
  @Field((_type) => ID)
  quizId: string
}

@ObjectType()
export class QuizSubmitsPayload {
  @Field((_type) => [QuizSubmit])
  quizSubmits: QuizSubmit[]

  @Field((_type) => Int)
  count: number
}

@ObjectType()
export class QuestionChoicesPayload {
  @Field((_type) => [QuestionChoice])
  questionChoices: QuestionChoice[]

  @Field()
  idRight: string
}
