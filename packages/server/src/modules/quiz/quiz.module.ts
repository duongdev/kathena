import { Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'

import { Question } from './models/Question'
import { QuestionChoice } from './models/QuestionChoice'
import { Quiz } from './models/Quiz'
import { QuestionResolver } from './question.resolver'
import { QuestionChoiceResolver } from './questionChoice.resolver'
import { QuizResolver } from './quiz.resolver'
import { QuizService } from './quiz.service'
// import { Course } from './models/Course'
// import { Lesson } from './models/Lesson'

@Module({
  imports: [
    TypegooseModule.forFeature([Question, QuestionChoice, Quiz]),
    // forwardRef(() => AccountModule),
  ],
  providers: [
    QuizResolver,
    QuestionResolver,
    QuestionChoiceResolver,
    QuizService,
  ],
  exports: [QuizService],
})
export class QuizModule {}
