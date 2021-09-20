import { UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, Mutation, Resolver, Query, ID } from '@nestjs/graphql'
import { DocumentType } from '@typegoose/typegoose'

import { CurrentAccount, UseAuthGuard } from 'core'
import { Account } from 'modules/account/models/Account'
import { P } from 'modules/auth/models'
import { Nullable, PageOptionsInput } from 'types'

import { Publication } from '../../core/models/PublicationState'

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
  ): Promise<Quiz | null> {
    const quiz = await this.quizService.createQuiz({
      ...quizInput,
      createdByAccountId: account.id,
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
}
