import {
  forwardRef,
  Inject /** , UsePipes, ValidationPipe */,
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

import { DocumentType } from '@typegoose/typegoose'

import { CurrentOrg, UseAuthGuard } from 'core/auth'
import { AuthService } from 'modules/auth/auth.service'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'
import { Nullable /* , PageOptionsInput */ } from 'types'

import { ClassworkService } from './classwork.service'
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

  /**
   * END MATERIAL RESOLVER
   */
}
