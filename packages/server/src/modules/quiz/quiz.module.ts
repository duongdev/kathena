import { Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'

import { Question } from './models/Question'
import { QuestionChoice } from './models/QuestionChoice'
import { Quiz } from './models/Quiz'
import { QuizSubmit } from './models/QuizSubmit'
import { QuestionResolver } from './question.resolver'
import { QuestionChoiceResolver } from './questionChoice.resolver'
import { QuizResolver } from './quiz.resolver'
import { QuizService } from './quiz.service'
import { QuizSubmitResolver } from './quizSubmit.resolver'
// import { Course } from './models/Course'
// import { Lesson } from './models/Lesson'

@Module({
  imports: [
    TypegooseModule.forFeature([Question, QuestionChoice, Quiz, QuizSubmit]),
    // forwardRef(() => AccountModule),
  ],
  providers: [
    QuizResolver,
    QuestionResolver,
    QuestionChoiceResolver,
    QuizSubmitResolver,
    QuizService,
  ],
  exports: [QuizService],
})
export class QuizModule {}
