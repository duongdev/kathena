import {
  forwardRef,
  Inject /** , UsePipes, ValidationPipe */,
} from '@nestjs/common'
import {
  Args,
  /* ID,
  Mutation,
  Parent, */
  Query,
  /* ResolveField, */
  Resolver,
} from '@nestjs/graphql'
// import { differenceInMinutes } from 'date-fns'
import { ForbiddenError } from 'type-graphql'

import { /* CurrentAccount, */ CurrentOrg, UseAuthGuard } from 'core/auth'
import { AuthService } from 'modules/auth/auth.service'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'
// import { Nullable, PageOptionsInput } from 'types'

import { PageOptionsInput } from 'types'

import { ClassworkService } from './classwork.service'
import {
  ClassworkAssignmentPayload,
  ClassworkFilterInput,
} from './classwork.type'
import { ClassworkAssignment } from './models/ClassworkAssignment'

@Resolver((_of) => ClassworkAssignment)
export class ClassworkAssignmentsResolver {
  constructor(
    private readonly classworkService: ClassworkService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  /**
   *START ASSIGNMENTS RESOLVER
   */

  @Query((_return) => ClassworkAssignmentPayload)
  @UseAuthGuard(P.Classwork_ListClassworkAssignment)
  async findAndPaginateClassworkAssignments(
    @Args('pageOptions') pageOptions: PageOptionsInput,
    @CurrentOrg() org: Org,
    @Args('filter') filter: ClassworkFilterInput,
  ): Promise<ClassworkAssignmentPayload> {
    if (org.id !== filter.orgId) {
      throw new ForbiddenError()
    }
    return this.classworkService.findAndPaginateClassworkAssignments(
      pageOptions,
      filter,
    )
  }

  /**
   * END ASSIGNMENTS RESOLVER
   */
}
