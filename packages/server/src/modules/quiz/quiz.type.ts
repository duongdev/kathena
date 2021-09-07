import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'

import { Publication } from 'core'

import { Quiz } from './models/Quiz'

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
}

@InputType()
export class QuizzesFilterInput {
  @Field((_type) => ID)
  courseId: string
}

@ObjectType()
export class QuizzesPayload {
  @Field((_type) => [Quiz])
  quizzes: Quiz[]

  @Field((_type) => Int)
  count: number
}
