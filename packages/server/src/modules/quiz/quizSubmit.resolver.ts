import { UsePipes, ValidationPipe } from '@nestjs/common'
import { Query, Args, ID, Mutation, Resolver } from '@nestjs/graphql'
import { DocumentType } from '@typegoose/typegoose'

import { CurrentAccount, UseAuthGuard } from 'core'
import { Account } from 'modules/account/models/Account'
import { Nullable } from 'types'

import { QuizSubmit } from './models/QuizSubmit'
import { QuizService } from './quiz.service'
import { CreateQuizSubmitInput, SubmitQuizInput } from './quiz.type'

@Resolver((_of) => QuizSubmit)
export class QuizSubmitResolver {
  constructor(private readonly quizService: QuizService) {}

  @Mutation((_returns) => QuizSubmit)
  @UseAuthGuard()
  @UsePipes(ValidationPipe)
  async createQuizSubmit(
    @Args('input') input: CreateQuizSubmitInput,
    @CurrentAccount() account: Account,
  ): Promise<QuizSubmit | null> {
    const quizSubmit = await this.quizService.createQuizSubmit({
      ...input,
      createdByAccountId: account.id,
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
  ): Promise<Nullable<DocumentType<QuizSubmit>>> {
    return this.quizService.findOneQuizSubmit(quizId, account.id)
  }
}
