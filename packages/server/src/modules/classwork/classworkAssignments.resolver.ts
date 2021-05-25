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
  Query,
  /* ResolveField, */
  Resolver,
} from '@nestjs/graphql'
// import { differenceInMinutes } from 'date-fns'
import { ForbiddenError } from 'type-graphql'
// eslint-disable-next-line import/order
import { DocumentType } from '@typegoose/typegoose'
import { CurrentAccount, CurrentOrg, Publication, UseAuthGuard } from 'core'
import { AuthService } from 'modules/auth/auth.service'
import { P } from 'modules/auth/models'
import { FileStorageService } from 'modules/fileStorage/fileStorage.service'
import { Org } from 'modules/org/models/Org'
import { ANY, Nullable, PageOptionsInput } from 'types'

import { ClassworkService } from './classwork.service'
import {
  CreateClassworkAssignmentInput,
  UpdateClassworkAssignmentInput,
  ClassworkAssignmentPayload,
  ClassworkFilterInput,
  AddAttachmentsToClassworkInput,
} from './classwork.type'
import { Classwork } from './models/Classwork'
import { ClassworkAssignment } from './models/ClassworkAssignment'

@Resolver((_of) => ClassworkAssignment)
export class ClassworkAssignmentsResolver {
  constructor(
    private readonly classworkService: ClassworkService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  /**
   *START ASSIGNMENTS RESOLVER
   */

  @Mutation((_returns) => ClassworkAssignment)
  @UseAuthGuard(P.Classwork_AddAttachmentsToClassworkAssignment)
  async addAttachmentsToClassworkAssignments(
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
    @Args('classworkAssignmentId', { type: () => ID })
    classworkAssignmentId: string,
    @Args('attachmentsInput') attachmentsInput: AddAttachmentsToClassworkInput,
  ): Promise<Nullable<DocumentType<ClassworkAssignment>>> {
    const promiseFileUpload = attachmentsInput.attachments
    const listFileId: ANY[] = []
    if (promiseFileUpload) {
      promiseFileUpload.map(async (document) => {
        const { createReadStream, filename, encoding } = await document

        // eslint-disable-next-line no-console
        console.log('encoding', encoding)

        const documentFile = await this.fileStorageService.uploadFromReadStream(
          {
            orgId: org.id,
            originalFileName: filename,
            readStream: createReadStream(),
            uploadedByAccountId: account.id,
          },
        )

        listFileId.push(documentFile.id)
      })
    }
    //
    return this.classworkService.addAttachmentsToClassworkAssignments(
      org.id,
      classworkAssignmentId,
      listFileId,
    )
  }

  @Query((_return) => ClassworkAssignment)
  @UseAuthGuard(P.Classwork_ListClassworkAssignment)
  async findClassworkAssignmentById(
    @Args('classworkAssignmentId', { type: () => ID })
    classworkAssignmentId: string,
    @CurrentOrg() org: Org,
  ): Promise<Nullable<DocumentType<ClassworkAssignment>>> {
    return this.classworkService.findClassworkAssignmentById(
      org.id,
      classworkAssignmentId,
    )
  }

  @Query((_return) => ClassworkAssignmentPayload)
  @UseAuthGuard(P.Classwork_ListClassworkAssignment)
  async classworkAssignments(
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

  @Mutation((_returns) => ClassworkAssignment)
  @UseAuthGuard(P.Classwork_UpdateClassworkAssignment)
  @UsePipes(ValidationPipe)
  async updateClassworkAssignment(
    @Args('id', { type: () => ID }) classworkAssignmentId: string,
    @Args('updateInput') updateInput: UpdateClassworkAssignmentInput,
    @CurrentOrg() currentOrg: Org,
    @CurrentAccount() currentAccount: Account,
  ): Promise<ClassworkAssignment> {
    return this.classworkService.updateClassworkAssignment(
      {
        id: classworkAssignmentId,
        accountId: currentAccount.id,
        orgId: currentOrg.id,
      },
      updateInput,
    )
  }

  @Mutation((_return) => ClassworkAssignment)
  @UseAuthGuard(P.Classwork_SetClassworkAssignmentPublication)
  @UsePipes(ValidationPipe)
  async updateClassworkAssignmentPublication(
    @Args('id', { type: () => ID }) classworkAssignmentId: string,
    @Args('publication', { type: () => String }) publication: Publication,
    @CurrentOrg() currentOrg: Org,
    @CurrentAccount() currentAccount: Account,
  ): Promise<ClassworkAssignment> {
    return this.classworkService.updateClassworkAssignmentPublication(
      {
        id: classworkAssignmentId,
        accountId: currentAccount.id,
        orgId: currentOrg.id,
      },
      publication,
    )
  }

  /**
   * END ASSIGNMENTS RESOLVER
   */
}
