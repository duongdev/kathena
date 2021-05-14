import {
  createUnionType /* , Field, ID, InputType, Int, ObjectType */,
  Field,
  InputType,
} from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'

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
@InputType()
export class CreateClassworkAssignmentInput {
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
