import { UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, Mutation, Resolver, Query, ID } from '@nestjs/graphql'
import { DocumentType } from '@typegoose/typegoose'

import { CurrentAccount, CurrentOrg, UseAuthGuard } from 'core'
import { Account } from 'modules/account/models/Account'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'
import { Nullable } from 'types'

import { Question } from './models/Question'
import { QuizService } from './quiz.service'
import { CreateQuestionInput } from './quiz.type'

@Resolver((_of) => Question)
export class QuestionResolver {
  constructor(private readonly quizService: QuizService) {}

  @Mutation((_returns) => Question)
  @UseAuthGuard(P.Teaching_Course_Access)
  @UsePipes(ValidationPipe)
  async createQuestion(
    @Args('input') questionInput: CreateQuestionInput,
    @CurrentAccount() account: Account,
    @CurrentOrg() org: Org,
  ): Promise<Question | null> {
    const question = await this.quizService.createQuestion({
      ...questionInput,
      createdByAccountId: account.id,
      orgId: org.id,
    })

    return question
  }

  @Query((_return) => Question)
  @UseAuthGuard()
  async question(
    @Args('id', { type: () => ID }) questionId: string,
  ): Promise<Nullable<DocumentType<Question>>> {
    return this.quizService.findQuestionById(questionId)
  }
}
