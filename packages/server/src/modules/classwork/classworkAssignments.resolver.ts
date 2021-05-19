import {
  forwardRef,
  Inject /** , UsePipes, ValidationPipe */,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import {
  Args,
  ID,
  Mutation,
  /* Parent, */
  Query,
  /* ResolveField, */
  Resolver,
} from '@nestjs/graphql'
// import { differenceInMinutes } from 'date-fns'
import { ForbiddenError } from 'type-graphql'

// eslint-disable-next-line import/order
import { CurrentAccount, CurrentOrg, UseAuthGuard } from 'core'
import { AuthService } from 'modules/auth/auth.service'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'

// import { Org } from 'modules/org/models/Org'
// import { Nullable, PageOptionsInput } from 'types'
import { PageOptionsInput } from 'types'

import { ClassworkService } from './classwork.service'
import {
  CreateClassworkAssignmentInput,
  UpdateClassworkAssignmentInput,
  ClassworkAssignmentPayload,
  ClassworkFilterInput,
} from './classwork.type'
// import { Classwork } from './models/Classwork'
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

  @Mutation((_returns) => ClassworkAssignment)
  @UseAuthGuard(P.Classwork_CreateClassworkAssignment)
  @UsePipes(ValidationPipe)
  async createClassworkAssignment(
    @Args('input')
    createClassworkAssignmentInput: CreateClassworkAssignmentInput,
    @Args('courseId', { type: () => ID }) courseId: string,
    @CurrentAccount() account: Account,
    @CurrentOrg() org: Org,
  ): Promise<ClassworkAssignment> {
    return this.classworkService.createClassworkAssignment(
      account.id,
      courseId,
      org.id,
      createClassworkAssignmentInput,
    )
  }

  @Mutation((_returns) => ClassworkAssignment)
  @UseAuthGuard(P.Classwork_UpdateClassworkAssignment)
  @UsePipes(ValidationPipe)
  async updateClassworkAssignment(
    @Args('id', { type: () => ID }) classworkAssignmentId: string,
    @Args('courseId', { type: () => ID }) courseId: string,
    @Args('updateInput') updateInput: UpdateClassworkAssignmentInput,
    @CurrentOrg() currentOrg: Org,
  ): Promise<ClassworkAssignment> {
    return this.classworkService.updateClassworkAssignment(
      {
        id: classworkAssignmentId,
        orgId: currentOrg.id,
      },
      updateInput,
    )
  }

  /**
   * END ASSIGNMENTS RESOLVER
   */
}
