import { forwardRef, Inject, UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, ID, Mutation, Resolver } from '@nestjs/graphql'

import { Logger, UseAuthGuard } from 'core'
import { CurrentAccount, CurrentOrg } from 'core/auth'
import { Account } from 'modules/account/models/Account'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'

import { AcademicService } from './academic.service'
import { CreateCourseInput } from './academic.type'
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
}
