import {
  ResolveField,
  /** Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField, */
  Resolver,
} from '@nestjs/graphql'
// import { differenceInMinutes } from 'date-fns'
// import { ForbiddenError } from 'type-graphql'

// import { CurrentAccount, CurrentOrg, UseAuthGuard } from 'core/auth'
// import { P } from 'modules/auth/models'
// import { Org } from 'modules/org/models/Org'
// import { Nullable, PageOptionsInput } from 'types'

import { ClassworkType } from './models/Classwork'

@Resolver('ResultClassworkUnion')
export class ResultClassworkUnionResolver {
  /**
   *START RESULT CLASSWORK UNION RESOLVER
   */

  @ResolveField()
  resolveType(value: { type: ClassworkType }) {
    if (value.type === ClassworkType.Material) {
      return 'ClassworkMaterial'
    }

    if (value.type === ClassworkType.Assignment) {
      return 'ClassworkAssignment'
    }

    return ['ClassworkMaterial', 'ClassworkAssignment']
  }

  /**
   * END RESULT CLASSWORK UNION RESOLVER
   */
}
