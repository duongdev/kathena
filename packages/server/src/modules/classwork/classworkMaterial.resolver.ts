import { forwardRef, Inject, UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { ID } from 'type-graphql'

import { CurrentOrg, UseAuthGuard } from 'core'
import { AuthService } from 'modules/auth/auth.service'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'

import { ClassworkService } from './classwork.service'
import { CreateClassworkMaterialInput } from './classwork.type'
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
  @Mutation((_return) => ClassworkMaterial)
  @UseAuthGuard(P.Academic_CreateClassworkMaterial)
  @UsePipes(ValidationPipe)
  async createClassworkMaterial(
    @Args('courseId', { type: () => ID }) courseId: string,
    @Args('CreateClassworkMaterialInput')
    createClassworkMaterialInput: CreateClassworkMaterialInput,
    @CurrentOrg() org: Org,
  ): Promise<ClassworkMaterial> {
    return this.classworkService.createClassworkMaterial(
      org.id,
      org.id,
      courseId,
      createClassworkMaterialInput,
    )
  }
  // TODO: Delete this line and start the code here

  /**
   * END MATERIAL RESOLVER
   */
}
