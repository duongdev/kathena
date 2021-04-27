import { forwardRef, Inject, UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { ForbiddenError } from 'type-graphql'

import { Logger, UseAuthGuard } from 'core'
import { CurrentAccount, CurrentOrg } from 'core/auth'
import { Account } from 'modules/account/models/Account'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'
import { PageOptionsInput } from 'types'

import { AcademicService } from './academic.service'
import {
  CoursesFilterInput,
  CoursesPayload,
  CreateCourseInput,
  UpdateCourseInput,
} from './academic.type'
import { Course } from './models/Course'

@Resolver((_of) => Course)
export class CourseResolver {
  private readonly logger = new Logger(CourseResolver.name)

  constructor(
    @Inject(forwardRef(() => AcademicService))
    private readonly academicService: AcademicService,
  ) {}

  @Mutation((_returns) => Course)
  @UseAuthGuard(P.Academic_CreateAcademicSubject)
  @UsePipes(ValidationPipe)
  async createCourse(
    @Args('input') createCourseInput: CreateCourseInput,
    @CurrentAccount() account: Account,
    @CurrentOrg() org: Org,
  ): Promise<Course> {
    return this.academicService.createCourse(
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
  ): Promise<Course> {
    return this.academicService.updateCourse(
      {
        id: courseId,
        orgId: currentOrg.id,
      },
      updateInput,
    )
  }

  @Mutation((_returns) => Course)
  @UseAuthGuard(P.Academic_ListCourses)
  @UsePipes(ValidationPipe)
  async findCourseById(
    @Args('id', { type: () => ID }) constId: string,
    @CurrentOrg() org: Org,
  ): Promise<Course | null> {
    return this.academicService.findCourseById(constId, org.id)
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
    return this.academicService.findAndPaginateCourses(pageOptions, filter)
  }

  @Mutation((_returns) => Course)
  @UseAuthGuard(P.Academic_RemoveStudentsFromCourse)
  @UsePipes(ValidationPipe)
  async removeStudentsFromCourse(
    @Args('id', { type: () => ID }) id: string,
    @Args('studentIds', { type: () => [ID] }) studentIds: string[],
    @CurrentOrg() org: Org,
  ): Promise<Course | null> {
    return this.academicService.removeStudentsFromCourse(
      {
        id,
        orgId: org.id,
      },
      studentIds,
    )
  }
}
