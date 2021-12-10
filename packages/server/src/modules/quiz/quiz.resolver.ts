import { UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, Mutation, Resolver, Query, ID } from '@nestjs/graphql'
import { DocumentType } from '@typegoose/typegoose'

import { CurrentAccount, CurrentOrg, Publication, UseAuthGuard } from 'core'
import { Account } from 'modules/account/models/Account'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'
import { Nullable, PageOptionsInput } from 'types'

import { Quiz } from './models/Quiz'
import { QuizService } from './quiz.service'
import {
  CreateQuizInput,
  QuizzesFilterInput,
  QuizzesPayload,
} from './quiz.type'

@Resolver((_of) => Quiz)
export class QuizResolver {
  constructor(private readonly quizService: QuizService) {}

  @Mutation((_returns) => Quiz)
  @UseAuthGuard(P.Teaching_Course_Access)
  @UsePipes(ValidationPipe)
  async createQuiz(
    @Args('input') quizInput: CreateQuizInput,
    @CurrentAccount() account: Account,
    @CurrentOrg() org: Org,
  ): Promise<Quiz | null> {
    const quiz = await this.quizService.createQuiz({
      ...quizInput,
      createdByAccountId: account.id,
      orgId: org.id,
    })

    return quiz
  }

  @Mutation((_returns) => Quiz)
  @UseAuthGuard(P.Teaching_Course_Access)
  @UsePipes(ValidationPipe)
  async updatePublicationQuiz(
    @Args('id') quizId: string,
    @Args('publicationState') publicationState: Publication,
  ): Promise<Quiz | null> {
    const quiz = await this.quizService.updatePublicationQuiz(
      quizId,
      publicationState,
    )
    return quiz
  }

  @Query((_return) => QuizzesPayload)
  @UseAuthGuard(P.Teaching_Course_Access)
  async quizzes(
    @Args('pageOptions') pageOptions: PageOptionsInput,
    @Args('filter') filter: QuizzesFilterInput,
  ): Promise<QuizzesPayload> {
    return this.quizService.findAndPaginateQuiz(pageOptions, filter)
  }

  @Query((_return) => QuizzesPayload)
  @UseAuthGuard()
  async quizzesStudying(
    @Args('pageOptions') pageOptions: PageOptionsInput,
    @Args('filter') filter: QuizzesFilterInput,
  ): Promise<QuizzesPayload> {
    return this.quizService.findAndPaginateQuiz(pageOptions, filter)
  }

  @Query((_return) => Quiz)
  @UseAuthGuard()
  async quiz(
    @Args('id', { type: () => ID }) quizId: string,
  ): Promise<Nullable<DocumentType<Quiz>>> {
    return this.quizService.findQuizById(quizId)
  }

  @Mutation((_returns) => [Quiz])
  @UseAuthGuard(P.Teaching_Course_Access)
  @UsePipes(ValidationPipe)
  async publishAllQuizOfTheCourse(
    @Args('courseId', {
      type: () => ID,
    })
    courseId: string,
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
  ): Promise<DocumentType<Quiz>[]> {
    return this.quizService.publishAllQuizOfTheCourse(
      courseId,
      org.id,
      account.id,
    )
  }
}
