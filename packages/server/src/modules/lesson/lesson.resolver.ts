import { forwardRef, Inject, UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { DocumentType } from '@typegoose/typegoose'

import { Logger } from 'core'
import { CurrentOrg, UseAuthGuard, CurrentAccount } from 'core/auth'
import { Account } from 'modules/account/models/Account'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'
import { Nullable, PageOptionsInput } from 'types'

import { LessonService } from './lesson.service'
import {
  CommentsForTheLessonByLecturerInput,
  CommentsForTheLessonByLecturerQuery,
  CreateLessonInput,
  LessonsFilterInput,
  LessonsPayload,
  UpdateLessonInput,
  UpdateLessonPublicationByIdInput,
} from './lesson.type'
import { Lesson } from './models/Lesson'

@Resolver((_of) => Lesson)
export class LessonResolver {
  private readonly logger = new Logger(LessonResolver.name)

  constructor(
    @Inject(forwardRef(() => LessonService))
    private readonly lessonService: LessonService,
  ) {}

  @Mutation((_returns) => Lesson)
  @UseAuthGuard(P.Academic_CreateLesson)
  @UsePipes(ValidationPipe)
  async createLesson(
    @Args('createLessonInput', { type: () => CreateLessonInput })
    createLessonInput: CreateLessonInput,
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
  ): Promise<DocumentType<Lesson>> {
    return this.lessonService.createLesson(
      org.id,
      account.id,
      createLessonInput,
    )
  }

  @Query((_returns) => LessonsPayload)
  @UseAuthGuard(P.Academic_ListLesson)
  async lessons(
    @Args('pageOptions', { type: () => PageOptionsInput })
    pageOptions: PageOptionsInput,
    @Args('filter', { type: () => LessonsFilterInput })
    filter: LessonsFilterInput,
    @CurrentAccount()
    account: Account,
    @CurrentOrg() org: Org,
  ): Promise<LessonsPayload> {
    return this.lessonService.findAndPaginateLessons(
      pageOptions,
      filter,
      account.id,
      org.id,
    )
  }

  @Mutation((_returns) => Lesson)
  @UseAuthGuard(P.Academic_UpdateLesson)
  @UsePipes(ValidationPipe)
  async updateLesson(
    @Args('courseId', { type: () => ID }) courseId: string,
    @Args('lessonId', { type: () => ID }) lessonId: string,
    @Args('updateInput', { type: () => UpdateLessonInput })
    updateInput: UpdateLessonInput,
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
  ): Promise<DocumentType<Lesson>> {
    return this.lessonService.updateLessonById(
      {
        lessonId,
        orgId: org.id,
        courseId,
      },
      updateInput,
      account.id,
    )
  }

  @Mutation((_returns) => Lesson)
  @UseAuthGuard(P.Academic_AddAbsentStudentsToLesson)
  @UsePipes(ValidationPipe)
  async addAbsentStudentsToLesson(
    @Args('courseId', { type: () => ID }) courseId: string,
    @Args('lessonId', { type: () => ID }) lessonId: string,
    @Args('absentStudentIds', { type: () => [String] })
    absentStudentIds: string[],
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
  ): Promise<DocumentType<Lesson>> {
    return this.lessonService.addAbsentStudentsToLesson(
      {
        lessonId,
        orgId: org.id,
        courseId,
      },
      absentStudentIds,
      account.id,
    )
  }

  @Mutation((_returns) => Lesson)
  @UseAuthGuard(P.Academic_RemoveAbsentStudentsFromLesson)
  @UsePipes(ValidationPipe)
  async removeAbsentStudentsFromLesson(
    @Args('courseId', { type: () => ID }) courseId: string,
    @Args('lessonId', { type: () => ID }) lessonId: string,
    @Args('absentStudentIds', { type: () => [String] })
    absentStudentIds: string[],
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
  ): Promise<DocumentType<Lesson>> {
    return this.lessonService.removeAbsentStudentsFromLesson(
      {
        lessonId,
        orgId: org.id,
        courseId,
      },
      absentStudentIds,
      account.id,
    )
  }

  @Query((_returns) => Lesson)
  @UseAuthGuard(P.Academic_UpdateLesson)
  @UsePipes(ValidationPipe)
  async updateLessonPublicationById(
    @Args('input', { type: () => UpdateLessonPublicationByIdInput })
    input: UpdateLessonPublicationByIdInput,
    @CurrentAccount() account: Account,
  ): Promise<Nullable<DocumentType<Lesson>>> {
    return this.lessonService.updateLessonPublicationById(input, account.id)
  }

  @Query((_returns) => Lesson)
  @UseAuthGuard(P.Academic_ListLesson)
  @UsePipes(ValidationPipe)
  async findLessonById(
    @Args('lessonId', { type: () => ID }) lessonId: string,
    @CurrentOrg() org: Org,
  ): Promise<Nullable<DocumentType<Lesson>>> {
    return this.lessonService.findLessonById(lessonId, org.id)
  }

  @Mutation((_returns) => Lesson)
  @UseAuthGuard(P.Academic_CommentsForTheLesson)
  @UsePipes(ValidationPipe)
  async commentsByLecturer(
    @Args('commentsForTheLessonByLecturerQuery', {
      type: () => CommentsForTheLessonByLecturerQuery,
    })
    commentsForTheLessonByLecturerQuery: CommentsForTheLessonByLecturerQuery,
    @Args('commentsForTheLessonByLecturerInput', {
      type: () => CommentsForTheLessonByLecturerInput,
    })
    commentsForTheLessonByLecturerInput: CommentsForTheLessonByLecturerInput,
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
  ): Promise<DocumentType<Lesson>> {
    return this.lessonService.commentsForTheLessonByLecturer(
      org.id,
      account.id,
      commentsForTheLessonByLecturerQuery,
      commentsForTheLessonByLecturerInput,
    )
  }

  // @Mutation((_returns) => ListLessons)
  // @UseAuthGuard(P.Academic_CreateLesson)
  // async generateLessons(
  //   @Args('courseId', { type: () => ID }) courseId: string,
  //   @Args('generateLessonsInput', { type: () => GenerateLessonsInput })
  //   generateLessonsInput: GenerateLessonsInput,
  //   @CurrentOrg() org: Org,
  //   @CurrentAccount() account: Account,
  // ): Promise<ListLessons> {
  //   return this.lessonService.generateLessons(
  //     org.id,
  //     courseId,
  //     account.id,
  //     generateLessonsInput,
  //   )
  // }
}
