import { forwardRef, Inject, UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, ID, Mutation, Resolver } from '@nestjs/graphql'

import { CurrentAccount, CurrentOrg, UseAuthGuard } from 'core'
import { AuthService } from 'modules/auth/auth.service'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'

import { ClassworkService } from './classwork.service'
import {
  UpdateClassworkMaterialInput,
  CreateClassworkMaterialInput,
} from './classwork.type'
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
  @UseAuthGuard(P.Classwork_CreateClassworkMaterial)
  @UsePipes(ValidationPipe)
  async createClassworkMaterial(
    @Args('courseId', { type: () => ID }) courseId: string,
    @Args('CreateClassworkMaterialInput')
    createClassworkMaterialInput: CreateClassworkMaterialInput,
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
  ): Promise<ClassworkMaterial> {
    return this.classworkService.createClassworkMaterial(
      account.id,
      org.id,
      courseId,
      createClassworkMaterialInput,
    )
  }

  // TODO: Delete this line and start the code here

  // TODO: classworkService.findClassworkMaterial

  // TODO: classworkService.updateClassworkMaterial

  @Mutation((_return) => ClassworkMaterial)
  @UseAuthGuard(P.Classwork_UpdateClassworkMaterial)
  @UsePipes(ValidationPipe)
  async updateClassworkMaterial(
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
    @Args('courseId', { type: () => ID })
    @Args('classworkMaterialId', { type: () => ID })
    classworkMaterialId: string,
    @Args('updateClassworkMaterialInput')
    updateClassworkMaterialInput: UpdateClassworkMaterialInput,
  ): Promise<ClassworkMaterial | null> {
    return this.classworkService.updateClassworkMaterial(
      org.id,
      account.id,
      classworkMaterialId,
      updateClassworkMaterialInput,
    )
  }

  // TODO: classworkService.updateClassworkMaterialPublication

  // TODO: classworkService.removeAttachmentsFromClassworkMaterial
  /**
   * END MATERIAL RESOLVER
   */
}
