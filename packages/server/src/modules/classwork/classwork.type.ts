import { Field, InputType, ID, Int, ObjectType } from '@nestjs/graphql'
import { IsNotEmpty, IsOptional } from 'class-validator'
import { FileUpload, GraphQLUpload } from 'graphql-upload'

import { Publication } from 'core'

import { ClassworkAssignment } from './models/ClassworkAssignment'
import { ClassworkMaterial } from './models/ClassworkMaterial'

@InputType()
export class UpdateClassworkMaterialInput {
  @Field({ nullable: true })
  title?: string

  @Field({ nullable: true })
  description?: string
}

@InputType()
export class CreateClassworkMaterialInput {
  @Field()
  title: string

  @Field({ nullable: true })
  description?: string

  @Field((_type) => Publication, { nullable: true })
  publicationState?: string

  @Field((_type) => [GraphQLUpload], { nullable: true })
  attachments?: Promise<FileUpload>[]
}

@ObjectType()
export class ClassworkAssignmentPayload {
  @Field((_type) => [ClassworkAssignment])
  classworkAssignments: ClassworkAssignment[]

  @Field((_type) => Int)
  count: number
}

@ObjectType()
export class ClassworkMaterialPayload {
  @Field((_type) => [ClassworkMaterial])
  classworkMaterials: []

  @Field((_type) => Int)
  count: number
}

@InputType()
export class ClassworkFilterInput {
  @Field((_type) => ID)
  orgId: string

  @Field((_type) => ID, { nullable: true })
  courseId?: string
}

@InputType()
export class CreateClassworkAssignmentInput {
  @Field()
  @IsNotEmpty({ message: 'Title cannot be empty' })
  title: string

  @Field()
  description?: string

  @Field((_type) => [GraphQLUpload], { defaultValue: [] })
  attachments?: Promise<FileUpload>[]

  @Field({ nullable: true })
  dueDate?: Date

  @Field((_type) => Publication, { nullable: true })
  publicationState?: string
}

@InputType()
export class UpdateClassworkAssignmentInput {
  @Field({ nullable: true })
  @IsOptional()
  title?: string

  @Field({ nullable: true })
  @IsOptional()
  description?: string

  @Field({ nullable: true })
  @IsOptional()
  dueDate?: string
}

@InputType()
export class AddAttachmentsToClassworkInput {
  @Field((_type) => [GraphQLUpload])
  attachments?: Promise<FileUpload>[]
}

@InputType()
export class CreateClassworkSubmissionInput {
  @Field((_type) => ID)
  classworkId: string

  @Field((_type) => [GraphQLUpload], { nullable: true })
  submissionFiles?: Promise<FileUpload>[]

  @Field({ nullable: true, defaultValue: null })
  @IsOptional()
  description?: string
}

@InputType()
export class SetGradeForClassworkSubmissionInput {
  @Field((_type) => ID)
  submissionId: string

  @Field((_type) => Number)
  grade: number
}

@InputType()
export class AvgGradeOfClassworkByCourseOptionInput {
  @Field({ nullable: true, defaultValue: 0 })
  limit: number
}

@ObjectType()
export class AvgGradeOfClassworkByCourse {
  @Field((_type) => String)
  classworkTitle: string

  @Field((_type) => Number)
  avgGrade: number
}
