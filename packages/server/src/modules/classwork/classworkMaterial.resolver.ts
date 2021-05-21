import { forwardRef, Inject, UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { DocumentType } from '@typegoose/typegoose'
import { ID } from 'type-graphql'

import { CurrentAccount, CurrentOrg, UseAuthGuard } from 'core'
import { AuthService } from 'modules/auth/auth.service'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'
import { Nullable /* , PageOptionsInput */ } from 'types'

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

  @Mutation((_returns) => ClassworkMaterial)
  @UseAuthGuard(P.Classwork_AddAttachmentsToClassworkMaterial)
  async addAttachmentsToClassworkMaterial(
    @CurrentOrg() org: Org,
    @Args('classworkMaterialId', { type: () => ID })
    classworkAssignmentId: string,
    @Args('attachments', { type: () => [String] }) attachments?: [],
  ): Promise<Nullable<DocumentType<ClassworkMaterial>>> {
    return this.classworkService.addAttachmentsToClassworkMaterial(
      org.id,
      classworkAssignmentId,
      attachments,
    )
  }

  @Mutation((_returns) => ClassworkMaterial)
  @UseAuthGuard(P.Classwork_RemoveAttachmentsFromClassworkMaterial)
  async removeAttachmentsFromClassworkMaterial(
    @CurrentOrg() org: Org,
    @Args('classworkMaterialId', { type: () => ID })
    classworkAssignmentId: string,
    @Args('attachments', { type: () => [String] }) attachments?: [],
  ): Promise<Nullable<DocumentType<ClassworkMaterial>>> {
    return this.classworkService.removeAttachmentsFromClassworkMaterial(
      org.id,
      classworkAssignmentId,
      attachments,
    )
  }

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

  // TODO: classworkService.updateClassworkMaterialPublication

  // TODO: classworkService.removeAttachmentsFromClassworkMaterial
  /**
   * END MATERIAL RESOLVER
   */
}
