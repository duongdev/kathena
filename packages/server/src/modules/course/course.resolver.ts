import { forwardRef, Inject, UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { ForbiddenError } from 'type-graphql'

import { Logger, Publication, UseAuthGuard } from 'core'
import { CurrentAccount, CurrentOrg } from 'core/auth'
import { Account } from 'modules/account/models/Account'
import { P } from 'modules/auth/models'
import {
  AvgGradeOfClassworkByCourse,
  AvgGradeOfClassworkByCourseOptionInput,
} from 'modules/classwork/classwork.type'
import { Org } from 'modules/org/models/Org'
import { Nullable, PageOptionsInput } from 'types'

import { CourseService } from './course.service'
import {
  CloneCourseInput,
  CoursesFilterInput,
  CoursesPayload,
  CreateCourseInput,
  UpdateCourseInput,
} from './course.type'
import { Course } from './models/Course'

@Resolver((_of) => Course)
export class CourseResolver {
  private readonly logger = new Logger(CourseResolver.name)

  constructor(
    @Inject(forwardRef(() => CourseService))
    private readonly courseService: CourseService,
  ) {}

  @Mutation((_returns) => Course)
  @UseAuthGuard(P.Academic_CreateCourse)
  @UsePipes(ValidationPipe)
  async createCourse(
    @Args('input') createCourseInput: CreateCourseInput,
    @CurrentAccount() account: Account,
    @CurrentOrg() org: Org,
  ): Promise<Course> {
    return this.courseService.createCourse(
      account.id,
      org.id,
      createCourseInput,
    )
  }

  @Mutation((_returns) => Course)
  @UseAuthGuard(P.Academic_UpdateCourse)
  @UsePipes(ValidationPipe)
  async updateCourse(
    @Args('id', { type: () => ID }) courseId: string,
    @Args('updateInput') updateInput: UpdateCourseInput,
    @CurrentOrg() currentOrg: Org,
  ): Promise<Nullable<Course>> {
    return this.courseService.updateCourse(
      {
        id: courseId,
        orgId: currentOrg.id,
      },
      updateInput,
    )
  }

  @Mutation((_returns) => Course)
  @UseAuthGuard(P.Academic_UpdateCourse)
  @UsePipes(ValidationPipe)
  async updateCoursePublicationById(
    @Args('courseId', { type: () => ID }) courseId: string,
    @Args('publication', { type: () => Publication }) publication: Publication,
    @CurrentOrg() currentOrg: Org,
  ): Promise<Course> {
    return this.courseService.updateCoursePublicationById(
      {
        courseId,
        orgId: currentOrg.id,
      },
      {
        publication,
      },
    )
  }

  @Query((_return) => Course)
  @UseAuthGuard(P.Academic_ListAcademicSubjects)
  async findCourseById(
    @Args('id', { type: () => ID }) courseId: string,
    @CurrentOrg() org: Org,
  ): Promise<Course | null> {
    return this.courseService.findCourseById(courseId, org.id)
  }

  @Mutation((_returns) => Course)
  @UseAuthGuard(P.Academic_AddLecturersToCourse)
  @UsePipes(ValidationPipe)
  async addLecturesToCourse(
    @Args('courseId', { type: () => ID }) courseId: string,
    @CurrentOrg() org: Org,
    @Args('lecturerIds', { type: () => [ID] })
    lecturerIds: string[],
  ): Promise<Course | null> {
    return this.courseService.addLecturersToCourse(
      {
        orgId: org.id,
        courseId,
      },
      lecturerIds,
    )
  }

  @Query((_return) => CoursesPayload)
  @UseAuthGuard(P.Academic_ListAcademicSubjects)
  async courses(
    @Args('pageOptions') pageOptions: PageOptionsInput,
    @CurrentOrg() org: Org,
    @Args('filter') filter: CoursesFilterInput,
  ): Promise<CoursesPayload> {
    if (org.id !== filter.orgId) {
      throw new ForbiddenError()
    }
    return this.courseService.findAndPaginateCourses(pageOptions, filter)
  }

  @Mutation((_returns) => Course)
  @UseAuthGuard(P.Academic_AddStudentsToCourse)
  async addStudentsToCourse(
    @Args('courseId', { type: () => ID }) courseId: string,
    @CurrentOrg() org: Org,
    @Args('studentIds', { type: () => [ID] })
    studentIds: string[],
  ): Promise<Course | null> {
    return this.courseService.addStudentsToCourse(
      {
        orgId: org.id,
        courseId,
      },
      studentIds,
    )
  }

  @Mutation((_returns) => Course)
  @UseAuthGuard(P.Academic_RemoveStudentsFromCourse)
  @UsePipes(ValidationPipe)
  async removeStudentsFromCourse(
    @Args('id', { type: () => ID }) id: string,
    @Args('studentIds', { type: () => [ID] }) studentIds: string[],
    @CurrentOrg() org: Org,
  ): Promise<Course | null> {
    return this.courseService.removeStudentsFromCourse(
      {
        id,
        orgId: org.id,
      },
      studentIds,
    )
  }

  @Mutation((_returns) => Course)
  @UseAuthGuard(P.Academic_RemoveLecturersFromCourse)
  @UsePipes(ValidationPipe)
  async removeLecturersFromCourse(
    @Args('id', { type: () => ID }) id: string,
    @Args('lecturerIds', { type: () => [ID] }) lecturerIds: string[],
    @CurrentOrg() org: Org,
  ): Promise<Course | null> {
    return this.courseService.removeLecturersFromCourse(
      {
        id,
        orgId: org.id,
      },
      lecturerIds,
    )
  }

  @Query((_returns) => [AvgGradeOfClassworkByCourse])
  @UseAuthGuard(P.AvgGradeStatisticsOfClassworkInTheCourse)
  async calculateAvgGradeOfClassworkAssignmentInCourse(
    @Args('courseId', { type: () => ID }) courseId: string,
    @CurrentOrg() org: Org,
    @Args('optionInput') optionInput: AvgGradeOfClassworkByCourseOptionInput,
  ): Promise<AvgGradeOfClassworkByCourse[]> {
    return this.courseService.calculateAvgGradeOfClassworkAssignmentInCourse(
      courseId,
      org.id,
      optionInput,
    )
  }

  @Mutation((_returns) => Course)
  @UseAuthGuard(P.Academic_CreateCourse)
  async cloneTheCourse(
    @Args('cloneCourseInput')
    cloneCourseInput: CloneCourseInput,
    @CurrentAccount()
    account: Account,
    @CurrentOrg()
    org: Org,
  ): Promise<Course> {
    return this.courseService.cloneTheCourse(
      account.id,
      org.id,
      cloneCourseInput,
    )
  }
}
