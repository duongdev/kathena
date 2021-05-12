// import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql'
// import { ArrayNotEmpty, IsEmail, IsOptional, MinLength } from 'class-validator'

import { Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'

// import { OrgRoleName } from 'modules/auth/models'

// import { Classwork } from './models/Classwork'

@InputType()
export class CreateClassworkAssignmentsInput {
  @Field()
  @IsNotEmpty({ message: 'CourseId cannot be empty' })
  courseId: string

  @Field()
  @IsNotEmpty({ message: 'Title cannot be empty' })
  title: string

  @Field()
  @IsNotEmpty({ message: 'Type cannot be empty' })
  type: string

  @Field()
  description: string

  @Field((_type) => [String], { defaultValue: [] })
  attachments: string

  @Field()
  @IsNotEmpty({ message: 'Duedate cannot be empty' })
  dueDate: string
}
