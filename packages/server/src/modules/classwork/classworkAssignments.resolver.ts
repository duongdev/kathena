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
import { DocumentType } from '@typegoose/typegoose'

// eslint-disable-next-line import/order
import { CurrentAccount, CurrentOrg, Publication, UseAuthGuard } from 'core'
import { AuthService } from 'modules/auth/auth.service'
import { P } from 'modules/auth/models'
// eslint-disable-next-line import/order
import { Org } from 'modules/org/models/Org'
import { Nullable, PageOptionsInput } from 'types'

import { ClassworkService } from './classwork.service'
import {
  CreateClassworkAssignmentInput,
  UpdateClassworkAssignmentInput,
  ClassworkAssignmentPayload,
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
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
    @Args('pageOptions') pageOptions: PageOptionsInput,
    @Args('courseId', { type: () => ID }) courseId: string,
    @Args('searchText', { nullable: true }) searchText?: string,
  ): Promise<ClassworkAssignmentPayload> {
    return this.classworkService.findAndPaginateClassworkAssignments(
      pageOptions,
      {
        orgId: org.id,
        accountId: account.id,
        courseId,
        searchText,
      },
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
