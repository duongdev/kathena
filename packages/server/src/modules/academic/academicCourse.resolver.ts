import { UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, ID, Mutation } from '@nestjs/graphql'

import { UseAuthGuard } from 'core'
import { P } from 'modules/auth/models'

// import { CreateCourse, UpdateCourse } from './academic.type'
import { AcademicService } from './academic.service'
import { Course } from './models/Course'

export class AcademicCourseResource {
  constructor(private readonly academicService: AcademicService) {}

  // @Mutation((_returns) => Course)
  // @UseAuthGuard(P.Academic_CreateCourse)
  // @UsePipes(ValidationPipe)
  // async createCourse() {} // createCourse: CreateCourse, //@Args('input')

  // @Mutation((_returns) => Course)
  // @UseAuthGuard(P.Academic_UpdateCourse)
  // @UsePipes(ValidationPipe)
  // async updateCourse() {} // updateCourse: UpdateCourse, //@Args('input')

  @Mutation((_returns) => Course)
  @UseAuthGuard(P.Academic_FindCourseById)
  @UsePipes(ValidationPipe)
  async findCourseById(@Args('id', { type: () => ID }) constId: string) {
    return this.academicService.findCourseById(constId)
  }
}
