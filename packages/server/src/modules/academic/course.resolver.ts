import { UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, ID, Mutation, Query } from '@nestjs/graphql'
import { ForbiddenError } from 'type-graphql'

import { CurrentOrg, UseAuthGuard } from 'core'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'
import { PageOptionsInput } from 'types'

// import { CreateCourse, UpdateCourse } from './academic.type'
import { AcademicService } from './academic.service'
import { CoursesFilterInput, CoursesPayload } from './academic.type'
import { Course } from './models/Course'

export class CourseResolver {
  constructor(private readonly academicService: AcademicService) {}

  // @Mutation((_returns) => Course)
  // @UseAuthGuard(P.Academic_CreateCourse)
  // @UsePipes(ValidationPipe)
  // async createCourse() {} //createCourse: CreateCourse, //@Args('input')

  // @Mutation((_returns) => Course)
  // @UseAuthGuard(P.Academic_UpdateCourse)
  // @UsePipes(ValidationPipe)
  // async updateCourse() {} //updateCourse: UpdateCourse, //@Args('input')

  @Mutation((_returns) => Course)
  @UseAuthGuard(P.Academic_FindCourseById)
  @UsePipes(ValidationPipe)
  async findCourseById(
    @Args('id', { type: () => ID }) constId: string,
  ): Promise<Course | null> {
    return this.academicService.findCourseById(constId)
  }

  @Query((_return) => CoursesPayload)
  @UseAuthGuard()
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
}
