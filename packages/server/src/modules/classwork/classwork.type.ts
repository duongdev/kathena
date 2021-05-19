import {
  createUnionType,
  Field,
  ID,
  InputType,
  Int,
  ObjectType,
} from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'

import { Publication } from 'core'

import { ClassworkType } from './models/Classwork'
import { ClassworkAssignment } from './models/ClassworkAssignment'
import { ClassworkMaterial } from './models/ClassworkMaterial'
// import { ArrayNotEmpty, IsEmail, IsOptional, MinLength } from 'class-validator'

// import { OrgRoleName } from 'modules/auth/models'

// import { Classwork } from './models/Classwork'

export const ResultClassworkUnion = createUnionType({
  name: 'ResultClassworkUnion',
  types: () => [ClassworkMaterial, ClassworkAssignment],
  resolveType(value) {
    if (value.type === ClassworkType.Material) {
      return [ClassworkMaterial]
    }

    if (value.type === ClassworkType.Assignment) {
      return [ClassworkAssignment]
    }

    return [ClassworkMaterial, ClassworkAssignment]
  },
})

@ObjectType()
export class ClassworkAssignmentPayload {
  @Field((_type) => [ClassworkAssignment])
  classworkAssignments: ClassworkAssignment[]

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
export class CreateClassworkMaterialInput {
  @Field()
  title: string

  @Field({ nullable: true })
  description?: string

  @Field((_type) => Publication)
  publicationState?: string
}

@InputType()
export class CreateClassworkAssignmentInput {
  @Field()
  @IsNotEmpty({ message: 'CreatedByAccountId cannot be empty' })
  createdByAccountId: string

  @Field()
  @IsNotEmpty({ message: 'Title cannot be empty' })
  title: string

  @Field()
  description?: string

  @Field((_type) => [String], { defaultValue: [] })
  attachments?: string[]

  @Field()
  @IsNotEmpty({ message: 'Due date cannot be empty' })
  dueDate: string
}
