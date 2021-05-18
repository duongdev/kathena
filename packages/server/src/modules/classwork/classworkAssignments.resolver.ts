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
  /* Parent,
  Query,
  ResolveField, */
  Resolver,
} from '@nestjs/graphql'

// eslint-disable-next-line import/order
import { DocumentType } from '@typegoose/typegoose'
import { CurrentAccount, CurrentOrg, UseAuthGuard } from 'core'
import { AuthService } from 'modules/auth/auth.service'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'
import { Nullable /* , PageOptionsInput */ } from 'types'

import { ClassworkService } from './classwork.service'
import { CreateClassworkAssignmentInput } from './classwork.type'
import { Classwork } from './models/Classwork'
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

  @Mutation((_returns) => ClassworkAssignment)
  @UseAuthGuard(P.Classwork_AddAttachmentsToClassworkAssignment)
  async addAttachmentsToClassworkAssignments(
    @CurrentOrg() org: Org,
    @Args('classworkAssignmentId', { type: () => ID })
    classworkAssignmentId: string,
    @Args('attachments', { type: () => [String] }) attachments?: [],
  ): Promise<Nullable<DocumentType<ClassworkAssignment>>> {
    // const image = await academicSubjectInput.image

    // const { createReadStream, filename, encoding } = image

    // // eslint-disable-next-line no-console
    // console.log('encoding', encoding)

    // const imageFile = await this.fileStorageService.uploadFromReadStream({
    //   orgId: org.id,
    //   originalFileName: filename,
    //   readStream: createReadStream(),
    //   uploadedByAccountId: account.id,
    // })

    // const academicSubject = await this.academicService.createAcademicSubject({
    //   ...academicSubjectInput,
    //   orgId: org.id,
    //   createdByAccountId: account.id,
    //   imageFileId: imageFile.id,
    // })

    //
    return this.classworkService.addAttachmentsToClassworkAssignments(
      org.id,
      classworkAssignmentId,
      attachments,
    )
  }

  @Mutation((_returns) => ClassworkAssignment)
  @UseAuthGuard(P.Classwork_RemoveAttachmentsFromClassworkAssignment)
  async removeAttachmentsFromClassworkAssignments(
    @CurrentOrg() org: Org,
    @Args('classworkAssignmentId', { type: () => ID })
    classworkAssignmentId: string,
    @Args('attachments', { type: () => [String] }) attachments?: [],
  ): Promise<Nullable<DocumentType<ClassworkAssignment>>> {
    return this.classworkService.removeAttachmentsFromClassworkAssignments(
      org.id,
      classworkAssignmentId,
      attachments,
    )
  }

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
      courseId,
      org.id,
      createClassworkAssignmentInput,
    )
  }

  /**
   * END ASSIGNMENTS RESOLVER
   */
}
