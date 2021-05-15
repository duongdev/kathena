import {
  forwardRef,
  Inject,
  Logger,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import {
  Args,
  ID,
  Mutation,
  /* Parent,
  Query,
  ResolveField, */
  Resolver,
} from '@nestjs/graphql'
// import { differenceInMinutes } from 'date-fns'
// import { ForbiddenError } from 'type-graphql'

import { /* CurrentAccount, */ CurrentOrg, UseAuthGuard } from 'core/auth'
import { AuthService } from 'modules/auth/auth.service'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'
// import { Nullable, PageOptionsInput } from 'types'

import { ClassworkService } from './classwork.service'
import { ClassworkAssignment } from './models/ClassworkAssignment'

@Resolver((_of) => ClassworkAssignment)
export class ClassworkAssignmentsResolver {
  private readonly logger = new Logger(ClassworkAssignmentsResolver.name)

  constructor(
    @Inject(forwardRef(() => ClassworkService))
    private readonly classworkService: ClassworkService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  /**
   *START ASSIGNMENTS RESOLVER
   */

  @Mutation((_returns) => [ClassworkAssignment])
  @UseAuthGuard(P.Classwork_ListClassworkAssignment)
  @UsePipes(ValidationPipe)
  async findClassworkAssignments(
    @CurrentOrg() org: Org,
    @Args('courseId', { type: () => ID, nullable: true }) courseId?: string,
    @Args('searchText', { type: () => String, nullable: true })
    searchText?: string,
  ): Promise<ClassworkAssignment[]> {
    return this.classworkService.findClassworkAssignments(
      org.id,
      courseId,
      searchText,
    )
  }

  /**
   * END ASSIGNMENTS RESOLVER
   */
}
