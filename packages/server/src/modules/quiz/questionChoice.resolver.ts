import { Args, Resolver, Query, ID } from '@nestjs/graphql'

import { UseAuthGuard } from 'core'

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
  ): Promise<QuestionChoicesPayload> {
    return this.quizService.questionChoices(questionId)
  }
}
