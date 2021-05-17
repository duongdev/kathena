import {
  forwardRef,
  Inject /** , UsePipes, ValidationPipe */,
} from '@nestjs/common'
import {
  Args,
  ID,
  /* Mutation,
  Parent, */
  Query,
  /* ResolveField, */
  Resolver,
} from '@nestjs/graphql'
// import { differenceInMinutes } from 'date-fns'
import { DocumentType } from '@typegoose/typegoose'
import { ForbiddenError } from 'type-graphql'

import { /* CurrentAccount, */ CurrentOrg, UseAuthGuard } from 'core/auth'
import { AuthService } from 'modules/auth/auth.service'
// import { Org } from 'modules/org/models/Org'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'
import { Nullable /* , PageOptionsInput */ } from 'types'

import { ClassworkService } from './classwork.service'
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

  @Query((_return) => ClassworkAssignment)
  @UseAuthGuard(P.Classwork_ListClassworkAssignment)
  async findClassworkAssignmentsById(
    @Args('classworkAssignmentId', { type: () => ID })
    classworkAssignmentId: string,
    @Args('orgId', { type: () => ID }) orgId: string,
    @CurrentOrg() org: Org,
  ): Promise<Nullable<DocumentType<ClassworkAssignment>>> {
    if (orgId !== org.id) {
      throw new ForbiddenError()
    }
    return this.classworkService.findClassworkAssignmentsById(
      classworkAssignmentId,
    )
  }

  /**
   * END ASSIGNMENTS RESOLVER
   */
}
