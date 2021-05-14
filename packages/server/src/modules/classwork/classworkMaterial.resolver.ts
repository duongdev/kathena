import { forwardRef, Inject, UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, Resolver } from '@nestjs/graphql'
import { ID, Mutation } from 'type-graphql'

import { CurrentOrg, UseAuthGuard } from 'core'
import { AuthService } from 'modules/auth/auth.service'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'

import { CurrentAccount } from '../../../dist/core'

import { ClassworkService } from './classwork.service'
import { CreateClassworkAssignmentInput } from './classwork.type'
import { Classwork } from './models/Classwork'
import { ClassworkAssignment } from './models/ClassworkAssignment'

@Resolver((_of) => Classwork)
export class ClassworkMaterialResolver {
  constructor(
    private readonly classworkService: ClassworkService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  /**
   *START MATERIAL RESOLVER
   */

  @Mutation((_returns) => Classwork)
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
      org.id,
      courseId,
      createClassworkAssignmentInput,
    )
  }

  /**
   * END MATERIAL RESOLVER
   */
}
