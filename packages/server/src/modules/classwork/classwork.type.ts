import { createUnionType, Field } from '@nestjs/graphql'

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

export class UpdateClassworkMaterialInput {
  @Field()
  title?: string

  @Field({ nullable: true })
  description?: string

  @Field((_type) => [Publication])
  publicationState?: string
}
