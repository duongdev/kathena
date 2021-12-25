import { UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { DocumentType } from '@typegoose/typegoose'

import { CurrentAccount, CurrentOrg, UseAuthGuard } from 'core'
import pubSub from 'core/utils/pubSub'
import { Account } from 'modules/account/models/Account'
import { P } from 'modules/auth/models'
import { CourseService } from 'modules/course/course.service'
import { Org } from 'modules/org/models/Org'
import { Nullable } from 'types'

import { ClassworkService } from './classwork.service'
import {
  AddFilesToClassworkSubmissionInput,
  ClassworkSubmissionStatusPayload,
  CreateClassworkSubmissionInput,
  SetGradeForClassworkSubmissionInput,
  SubmissionStatusStatistics,
  UpdateClassworkSubmissionInput,
} from './classwork.type'
import {
  ClassworkSubmission,
  ClassworkSubmissionStatus,
} from './models/ClassworkSubmission'

@Resolver((_of) => ClassworkSubmission)
export class ClassworkSubmissionResolver {
  constructor(
    private readonly classworkService: ClassworkService,
    private readonly courseService: CourseService,
  ) {}

  @Mutation((_return) => ClassworkSubmission)
  @UseAuthGuard(P.Classwork_CreateClassworkSubmission)
  @UsePipes(ValidationPipe)
  async createClassworkSubmission(
    @Args('courseId', { type: () => ID }) courseId: string,
    @Args('createClassworkSubmissionInput')
    createClassworkSubmissionInput: CreateClassworkSubmissionInput,
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
  ): Promise<ClassworkSubmission> {
    const classworkSubmission =
      await this.classworkService.createClassworkSubmission(
        org.id,
        courseId,
        account.id,
        createClassworkSubmissionInput,
      )

    // Send notification
    const course = await this.courseService.findCourseById(courseId, org.id)
    let numberOfStudent = 0

    if (course) {
      numberOfStudent = course.studentIds.length
    }

    const classworkAssignment =
      await this.classworkService.findClassworkAssignmentById(
        org.id,
        classworkSubmission.classworkId,
      )

    const listStudentsSubmitted =
      await this.classworkService.getListOfStudentsSubmitAssignmentsByStatus(
        classworkSubmission.classworkId,
        ClassworkSubmissionStatus.Submitted,
      )

    if (listStudentsSubmitted.count === 1) {
      pubSub.publish('notification', {
        notification: {
          title: `Vừa có 1 học viên nộp bài tập "${classworkAssignment?.title}" ở khóa học ${course?.name} của bạn.`,
          accountIds: course?.lecturerIds,
        },
      })
    } else if (listStudentsSubmitted.count === Math.ceil(numberOfStudent / 2)) {
      pubSub.publish('notification', {
        notification: {
          title: `Đã có 50% học viên nộp bài tập "${classworkAssignment?.title}" ở khóa học ${course?.name} của bạn.`,
          accountIds: course?.lecturerIds,
        },
      })
    } else if (listStudentsSubmitted.count === numberOfStudent) {
      pubSub.publish('notification', {
        notification: {
          title: `Tất cả học viên đã hoàn thành bài tập "${classworkAssignment?.title}" ở khóa học ${course?.name} của bạn.`,
          accountIds: course?.lecturerIds,
        },
      })
    }

    return classworkSubmission
  }

  @Mutation((_return) => ClassworkSubmission)
  @UseAuthGuard(P.Classwork_SetGradeForClassworkSubmission)
  @UsePipes(ValidationPipe)
  async setGradeForClassworkSubmission(
    @Args('setGradeForClassworkSubmissionInput')
    setGradeForClassworkSubmissionInput: SetGradeForClassworkSubmissionInput,
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
  ): Promise<ClassworkSubmission> {
    return this.classworkService.setGradeForClassworkSubmission(
      org.id,
      account.id,
      setGradeForClassworkSubmissionInput,
    )
  }

  @Query((_return) => [ClassworkSubmission])
  @UseAuthGuard(P.Classwork_ListClassworkSubmission)
  @UsePipes(ValidationPipe)
  async classworkSubmissions(
    @Args('classworkAssignmentId', { type: () => ID })
    classworkAssignmentId: string,
    @CurrentAccount() account: Account,
    @CurrentOrg() org: Org,
  ): Promise<ClassworkSubmission[]> {
    return this.classworkService.listClassworkSubmissionsByClassworkAssignmentId(
      account.id,
      org.id,
      classworkAssignmentId,
    )
  }

  @Query((_return) => ClassworkSubmission)
  @UseAuthGuard(P.Classwork_ListClassworkSubmission)
  @UsePipes(ValidationPipe)
  async findClassworkSubmissionById(
    @Args('classworkSubmissionId', { type: () => ID })
    classworkSubmissionId: string,
    @CurrentOrg() org: Org,
  ): Promise<Nullable<ClassworkSubmission>> {
    return this.classworkService.findClassworkSubmissionById(
      org.id,
      classworkSubmissionId,
    )
  }

  @Query((_return) => ClassworkSubmission)
  @UseAuthGuard(P.Classwork_ListClassworkSubmission)
  @UsePipes(ValidationPipe)
  async findOneClassworkSubmission(
    @Args('ClassworkAssignment', { type: () => ID })
    ClassworkAssignment: string,
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
  ): Promise<Nullable<ClassworkSubmission>> {
    return this.classworkService.findOneClassworkSubmission(
      org.id,
      account.id,
      ClassworkAssignment,
    )
  }

  @Query((_return) => ClassworkSubmissionStatusPayload)
  @UseAuthGuard(P.Classwork_ShowSubmissionStatusList)
  async getListOfStudentsSubmitAssignmentsByStatus(
    @Args('classworkAssignmentId', { type: () => ID })
    classworkAssignmentId: string,
    @Args('classworkSubmissionStatus', {
      type: () => String,
    })
    classworkSubmissionStatus: ClassworkSubmissionStatus,
  ): Promise<ClassworkSubmissionStatusPayload> {
    return this.classworkService.getListOfStudentsSubmitAssignmentsByStatus(
      classworkAssignmentId,
      classworkSubmissionStatus,
    )
  }

  @Query((_return) => [SubmissionStatusStatistics])
  @UseAuthGuard(P.Classwork_ShowSubmissionStatusList)
  async submissionStatusStatistics(
    @Args('classworkAssignmentId', { type: () => ID })
    classworkAssignmentId: string,
  ): Promise<SubmissionStatusStatistics[]> {
    return this.classworkService.submissionStatusStatistics(
      classworkAssignmentId,
    )
  }

  @Mutation((_return) => ClassworkSubmission)
  @UseAuthGuard(P.Classwork_UpdateClassworkSubmission)
  @UsePipes(ValidationPipe)
  async updateClassworkSubmission(
    @CurrentAccount() account: Account,
    @CurrentOrg() org: Org,
    @Args('classworkAssignmentId', { type: () => ID })
    classworkAssignmentId: string,
    @Args('updateInput', { type: () => UpdateClassworkSubmissionInput })
    updateInput: UpdateClassworkSubmissionInput,
  ): Promise<DocumentType<ClassworkSubmission>> {
    return this.classworkService.updateClassworkSubmission(
      {
        classworkSubmissionId: classworkAssignmentId,
        accountId: account.id,
        orgId: org.id,
      },
      updateInput,
    )
  }

  @Mutation((_returns) => ClassworkSubmission)
  @UseAuthGuard(P.Classwork_UpdateClassworkSubmission)
  async addFilesToClassworkSubmission(
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
    @Args('classworkSubmissionId', { type: () => ID })
    classworkSubmissionId: string,
    @Args('submissionFilesInput')
    submissionFilesInput: AddFilesToClassworkSubmissionInput,
  ): Promise<Nullable<DocumentType<ClassworkSubmission>>> {
    return this.classworkService.addFilesToClassworkSubmission(
      org.id,
      classworkSubmissionId,
      submissionFilesInput,
      account.id,
    )
  }

  @Mutation((_returns) => ClassworkSubmission)
  @UseAuthGuard(P.Classwork_UpdateClassworkSubmission)
  async removeFilesFromClassworkSubmission(
    @CurrentOrg() org: Org,
    @Args('classworkSubmissionId', { type: () => ID })
    classworkSubmissionId: string,
    @Args('submissionFilesInput', { type: () => [String], nullable: true })
    submissionFilesInput: string[],
  ): Promise<Nullable<DocumentType<ClassworkSubmission>>> {
    return this.classworkService.removeFilesFromClassworkSubmission(
      org.id,
      classworkSubmissionId,
      submissionFilesInput,
    )
  }
}
