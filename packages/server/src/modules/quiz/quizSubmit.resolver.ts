import { UsePipes, ValidationPipe } from '@nestjs/common'
import { Query, Args, ID, Mutation, Resolver } from '@nestjs/graphql'
import { DocumentType } from '@typegoose/typegoose'

import { CurrentAccount, UseAuthGuard, CurrentOrg } from 'core'
import { Account } from 'modules/account/models/Account'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'
import { Nullable, PageOptionsInput } from 'types'

import { QuizSubmit } from './models/QuizSubmit'
import { QuizService } from './quiz.service'
import {
  CreateQuizSubmitInput,
  QuizSubmitsFilterInput,
  QuizSubmitsPayload,
  SubmitQuizInput,
} from './quiz.type'

@Resolver((_of) => QuizSubmit)
export class QuizSubmitResolver {
  constructor(private readonly quizService: QuizService) {}

  @Mutation((_returns) => QuizSubmit)
  @UseAuthGuard()
  @UsePipes(ValidationPipe)
  async createQuizSubmit(
    @Args('input') input: CreateQuizSubmitInput,
    @CurrentAccount() account: Account,
    @CurrentOrg() org: Org,
  ): Promise<QuizSubmit | null> {
    const quizSubmit = await this.quizService.createQuizSubmit({
      ...input,
      createdByAccountId: account.id,
      orgId: org.id,
    })

    return quizSubmit
  }

  @Mutation((_returns) => QuizSubmit)
  @UseAuthGuard()
  @UsePipes(ValidationPipe)
  async submitQuiz(
    @Args('input') input: SubmitQuizInput,
  ): Promise<QuizSubmit | null> {
    const quizSubmit = await this.quizService.submitQuiz(input)

    return quizSubmit
  }

  @Query((_return) => QuizSubmit)
  @UseAuthGuard()
  async quizSubmit(
    @Args('quizId', { type: () => ID }) quizId: string,
    @CurrentAccount() account: Account,
    @CurrentOrg() org: Org,
  ): Promise<Nullable<DocumentType<QuizSubmit>>> {
    return this.quizService.findOneQuizSubmit(quizId, org.id, account.id)
  }

  @Query((_return) => QuizSubmit)
  @UseAuthGuard(P.Teaching_Course_Access)
  async findQuizSubmitById(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Nullable<DocumentType<QuizSubmit>>> {
    return this.quizService.findQuizSubmitById(id)
  }

  @Query((_return) => QuizSubmitsPayload)
  @UseAuthGuard(P.Teaching_Course_Access)
  async quizSubmits(
    @Args('pageOptions') pageOptions: PageOptionsInput,
    @Args('filter') filter: QuizSubmitsFilterInput,
  ): Promise<QuizSubmitsPayload> {
    return this.quizService.findAndPaginateQuizSubmit(pageOptions, filter)
  }
}
