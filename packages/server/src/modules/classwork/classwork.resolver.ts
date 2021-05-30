import { ResolveField, Resolver } from '@nestjs/graphql'

import { Comment } from 'modules/comment/model/Comment'
import { ANY } from 'types'

import { Classwork, ClassworkType } from './models/Classwork'

@Resolver((_of) => Classwork)
export class ClassworkResolver {
  /**
   *START CLASSWORK RESOLVER
   */

  // This ABC needs to be redone
  @ResolveField((_returns) => [String])
  resolveType(value: { type: ClassworkType }): [...ANY] {
    if (value.type === ClassworkType.Material) {
      return ['ClassworkMaterial']
    }

    if (value.type === ClassworkType.Assignment) {
      return ['ClassworkAssignment']
    }

    return ['ClassworkMaterial', 'ClassworkAssignment']
  }

  // This ABC needs to be redone
  @ResolveField((_returns) => [Comment])
  comments(): [] {
    return []
  }

  /**
   * END CLASSWORK RESOLVER
   */
}
