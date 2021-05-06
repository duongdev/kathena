import { forwardRef, Inject, UsePipes, ValidationPipe } from '@nestjs/common'
import {
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
import { AuthService } from 'modules/auth/auth.service'
// import { Org } from 'modules/org/models/Org'
// import { Nullable, PageOptionsInput } from 'types'

import { ClassworkService } from './classwork.service'
import { Classwork } from './models/Classwork'

@Resolver((_of) => Classwork)
export class AssignmentsResolver {
  constructor(
    private readonly classworkService: ClassworkService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  /**
   *START ASSIGNMENTS RESOLVER
   */

  // TODO: Delete this line and start the code here

  /**
   * END ASSIGNMENTS RESOLVER
   */
}
