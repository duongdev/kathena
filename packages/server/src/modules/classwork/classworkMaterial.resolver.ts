import { UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { DocumentType } from '@typegoose/typegoose'

import { CurrentAccount, CurrentOrg, Publication, UseAuthGuard } from 'core'
import pubSub from 'core/utils/pubSub'
import { Account } from 'modules/account/models/Account'
import { P } from 'modules/auth/models'
import { CourseService } from 'modules/course/course.service'
import { Org } from 'modules/org/models/Org'
import { Nullable, PageOptionsInput } from 'types'

import { ClassworkService } from './classwork.service'
import {
  UpdateClassworkMaterialInput,
  CreateClassworkMaterialInput,
  ClassworkMaterialPayload,
  AddAttachmentsToClassworkInput,
  AddVideoToClassworkInput,
} from './classwork.type'
import { ClassworkMaterial } from './models/ClassworkMaterial'

@Resolver((_of) => ClassworkMaterial)
export class ClassworkMaterialResolver {
  constructor(
    private readonly classworkService: ClassworkService,
    private readonly courseService: CourseService,
  ) {}

  /**
   *START MATERIAL RESOLVER
   */

  @Query((_return) => ClassworkMaterialPayload)
  @UseAuthGuard(P.Classwork_ListClassworkMaterial)
  async classworkMaterials(
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
    @Args('pageOptions') pageOptions: PageOptionsInput,
    @Args('courseId') courseId: string,
    @Args('searchText', { nullable: true }) searchText?: string,
  ): Promise<{
    classworkMaterials: DocumentType<ClassworkMaterial>[]
    count: number
  }> {
    return this.classworkService.findAndPaginateClassworkMaterials(
      pageOptions,
      {
        orgId: org.id,
        accountId: account.id,
        courseId,
        searchText,
      },
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
    const classworkMaterial =
      await this.classworkService.createClassworkMaterial(
        account.id,
        org.id,
        courseId,
        createClassworkMaterialInput,
      )

    const course = await this.courseService.findCourseById(courseId, org.id)

    if (classworkMaterial.publicationState === Publication.Published) {
      pubSub.publish('notification', {
        notification: {
          title: `Bạn vừa có tài liệu mới ở khóa học ${course?.name}`,
          accountIds: course?.studentIds,
        },
      })
    }

    return classworkMaterial
  }

  @Mutation((_return) => ClassworkMaterial)
  @UseAuthGuard(P.Classwork_UpdateClassworkMaterial)
  @UsePipes(ValidationPipe)
  async updateClassworkMaterial(
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
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

  @Mutation((_return) => ClassworkMaterial)
  @UseAuthGuard(P.Classwork_SetClassworkMaterialPublication)
  @UsePipes(ValidationPipe)
  async updateClassworkMaterialPublication(
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
    @Args('classworkMaterialId', { type: () => ID, nullable: false })
    classworkMaterialId: string,
    @Args('publicationState', { type: () => Publication, nullable: false })
    publicationState: Publication,
  ): Promise<ClassworkMaterial> {
    const classworkMaterial =
      await this.classworkService.updateClassworkMaterialPublication(
        {
          orgId: org.id,
          accountId: account.id,
          classworkMaterialId,
        },
        publicationState,
      )

    const course = await this.courseService.findCourseById(
      classworkMaterial.courseId,
      org.id,
    )

    if (classworkMaterial.publicationState === Publication.Published) {
      pubSub.publish('notification', {
        notification: {
          title: `Bạn vừa có tài liệu mới ở khóa học ${course?.name}`,
          accountIds: course?.studentIds,
        },
      })
    }

    return classworkMaterial
  }

  @Query((_return) => ClassworkMaterial)
  @UseAuthGuard(P.Classwork_ListClassworkMaterial)
  async classworkMaterial(
    @Args('Id', { type: () => ID })
    classworkMaterialId: string,
    @CurrentOrg() org: Org,
  ): Promise<Nullable<DocumentType<ClassworkMaterial>>> {
    return this.classworkService.findClassworkMaterialById(
      org.id,
      classworkMaterialId,
    )
  }

  @Mutation((_returns) => ClassworkMaterial)
  @UseAuthGuard(P.Classwork_AddAttachmentsToClassworkMaterial)
  async addAttachmentsToClassworkMaterial(
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
    @Args('classworkMaterialId', { type: () => ID })
    classworkAssignmentId: string,
    @Args('attachmentsInput') attachmentsInput: AddAttachmentsToClassworkInput,
  ): Promise<Nullable<DocumentType<ClassworkMaterial>>> {
    return this.classworkService.addAttachmentsToClassworkMaterial(
      org.id,
      classworkAssignmentId,
      attachmentsInput,
      account.id,
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

  @Mutation((_returns) => ClassworkMaterial)
  @UseAuthGuard(P.Classwork_AddVideoToClassworkAssignment)
  async addVideoToClassworkMaterial(
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
    @Args('classworkMaterialId', { type: () => ID })
    classworkMaterialId: string,
    @Args('videoInput') videoInput: AddVideoToClassworkInput,
  ): Promise<Nullable<DocumentType<ClassworkMaterial>>> {
    return this.classworkService.addVideoToClassworkMaterial(
      org.id,
      classworkMaterialId,
      videoInput,
      account.id,
    )
  }

  /**
   * END MATERIAL RESOLVER
   */
}
