import { createUnionType, Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'

import { Publication } from 'core'

import { ClassworkType } from './models/Classwork'
import { ClassworkAssignment } from './models/ClassworkAssignment'
import { ClassworkMaterial } from './models/ClassworkMaterial'

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
export class UpdateClassworkMaterialInput {
  @Field()
  title?: string

  @Field({ nullable: true })
  description?: string

  @Field((_type) => [Publication])
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
  attachments?: string

  @Field()
  @IsNotEmpty({ message: 'Duedate cannot be empty' })
  dueDate: string
}
