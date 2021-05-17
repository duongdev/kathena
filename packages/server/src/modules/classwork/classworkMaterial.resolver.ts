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
  /** Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField, */
  Resolver,
} from '@nestjs/graphql'

import { CurrentAccount, CurrentOrg, UseAuthGuard } from 'core/auth'
// import { differenceInMinutes } from 'date-fns'
// import { ForbiddenError } from 'type-graphql'

// import { CurrentAccount, CurrentOrg, UseAuthGuard } from 'core/auth'
import { AuthService } from 'modules/auth/auth.service'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'
// import { P } from 'modules/auth/models'
// import { Org } from 'modules/org/models/Org'
// import { Nullable, PageOptionsInput } from 'types'

import { ClassworkService } from './classwork.service'
import { UpdateClassworkMaterialInput } from './classwork.type'
import { Classwork } from './models/Classwork'
import { ClassworkMaterial } from './models/ClassworkMaterial'

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

  // TODO: Delete this line and start the code here
  @Mutation((_return) => ClassworkMaterial)
  @UseAuthGuard(P.Classwork_UpdateClassworkMaterial)
  @UsePipes(ValidationPipe)
  async updateClassworkMaterial(
    @CurrentOrg() org: Org,
    @Args('courseId', { type: () => ID })
    courseId: string,
    @Args('classworkMaterialId', { type: () => ID })
    classworkMaterialId: string,
    @Args('updateClassworkMaterial')
    updateClassworkMaterialInput: UpdateClassworkMaterialInput,
    @CurrentAccount() account: Account,
  ): Promise<ClassworkMaterial> {
    return this.classworkService.updateClassworkMaterial(
      org.id,
      account.id,
      courseId,
      classworkMaterialId,
      updateClassworkMaterialInput,
    )
  }
  /**
   * END MATERIAL RESOLVER
   */
}
