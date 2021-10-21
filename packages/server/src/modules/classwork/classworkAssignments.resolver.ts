import { UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { DocumentType } from '@typegoose/typegoose'

import {
  CurrentAccount,
  CurrentOrg,
  Logger,
  Publication,
  UseAuthGuard,
} from 'core'
import pubSub from 'core/utils/pubSub'
import { Account } from 'modules/account/models/Account'
import { P } from 'modules/auth/models'
import { CourseService } from 'modules/course/course.service'
import { Org } from 'modules/org/models/Org'
import { Nullable, PageOptionsInput } from 'types'

import { ClassworkService } from './classwork.service'
import {
  CreateClassworkAssignmentInput,
  UpdateClassworkAssignmentInput,
  ClassworkAssignmentPayload,
  AddAttachmentsToClassworkInput,
  ClassworkAssignmentByStudentIdInCourseInput,
  ClassworkAssignmentByStudentIdInCourseResponsePayload,
  AddVideoToClassworkInput,
} from './classwork.type'
import { ClassworkAssignment } from './models/ClassworkAssignment'

@Resolver((_of) => ClassworkAssignment)
export class ClassworkAssignmentsResolver {
  private readonly logger = new Logger(ClassworkAssignmentsResolver.name)

  constructor(
    private readonly classworkService: ClassworkService,
    private readonly courseService: CourseService,
  ) {}

  /**
   *START ASSIGNMENTS RESOLVER
   */

  @Query((_return) => ClassworkAssignment)
  @UseAuthGuard(P.Classwork_ListClassworkAssignment)
  async classworkAssignment(
    @Args('id', { type: () => ID })
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
    const classworkAssignment =
      await this.classworkService.createClassworkAssignment(
        account.id,
        courseId,
        org.id,
        createClassworkAssignmentInput,
      )

    const course = await this.courseService.findCourseById(courseId, org.id)

    if (classworkAssignment.publicationState === Publication.Published) {
      pubSub.publish('notification', {
        notification: {
          title: `Bạn vừa có bài tập mới ở khóa học ${course?.name}`,
          accountIds: course?.studentIds,
        },
      })
    }

    return classworkAssignment
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
    const classworkAssignment =
      await this.classworkService.updateClassworkAssignmentPublication(
        {
          id: classworkAssignmentId,
          accountId: currentAccount.id,
          orgId: currentOrg.id,
        },
        publication,
      )

    const course = await this.courseService.findCourseById(
      classworkAssignment.courseId,
      currentOrg.id,
    )

    if (classworkAssignment.publicationState === Publication.Published) {
      pubSub.publish('notification', {
        title: `Bạn vừa có bài tập mới ở khóa học ${course?.name}`,
        accountIds: course?.studentIds,
      })
    }

    return classworkAssignment
  }

  @Mutation((_returns) => ClassworkAssignment)
  @UseAuthGuard(P.Classwork_AddAttachmentsToClassworkAssignment)
  async addAttachmentsToClassworkAssignment(
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
    @Args('classworkAssignmentId', { type: () => ID })
    classworkAssignmentId: string,
    @Args('attachmentsInput') attachmentsInput: AddAttachmentsToClassworkInput,
  ): Promise<Nullable<DocumentType<ClassworkAssignment>>> {
    return this.classworkService.addAttachmentsToClassworkAssignment(
      org.id,
      classworkAssignmentId,
      attachmentsInput,
      account.id,
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
    return this.classworkService.removeAttachmentsFromClassworkAssignment(
      org.id,
      classworkAssignmentId,
      attachments,
    )
  }

  @Query((_return) => ClassworkAssignmentByStudentIdInCourseResponsePayload)
  @UseAuthGuard(P.Classwork_ListClassworkSubmission)
  @UsePipes(ValidationPipe)
  async listClassworkAssignmentsByStudentIdInCourse(
    @Args('Input')
    input: ClassworkAssignmentByStudentIdInCourseInput,
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
  ): Promise<ClassworkAssignmentByStudentIdInCourseResponsePayload> {
    return this.classworkService.listClassworkAssignmentsByStudentIdInCourse(
      input,
      org.id,
      account.id,
    )
  }

  @Mutation((_returns) => ClassworkAssignment)
  @UseAuthGuard(P.Classwork_AddVideoToClassworkAssignment)
  async addVideoToClassworkAssignment(
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
    @Args('classworkAssignmentId', { type: () => ID })
    classworkAssignmentId: string,
    @Args('videoInput') videoInput: AddVideoToClassworkInput,
  ): Promise<Nullable<DocumentType<ClassworkAssignment>>> {
    return this.classworkService.addVideoToClassworkAssignment(
      org.id,
      classworkAssignmentId,
      videoInput,
      account.id,
    )
  }

  /**
   * END ASSIGNMENTS RESOLVER
   */
}
