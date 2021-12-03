import { Args, Resolver, Query, ID } from '@nestjs/graphql'

import { CurrentOrg, UseAuthGuard } from 'core'
import { Org } from 'modules/org/models/Org'

import { QuestionChoice } from './models/QuestionChoice'
import { QuizService } from './quiz.service'
import { QuestionChoicesPayload } from './quiz.type'

@Resolver((_of) => QuestionChoice)
export class QuestionChoiceResolver {
  constructor(private readonly quizService: QuizService) {}

  @Query((_return) => QuestionChoicesPayload)
  @UseAuthGuard()
  async questionChoices(
    @Args('questionId', { type: () => ID }) questionId: string,
    @CurrentOrg() org: Org,
  ): Promise<QuestionChoicesPayload> {
    return this.quizService.questionChoices(questionId, org.id)
  }
}
