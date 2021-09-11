// import { forwardRef, Inject } from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'

import { InjectModel, Logger, Publication, Service } from 'core'
import { Nullable } from 'types'

// import { AccountService } from 'modules/account/account.service'
// import { AuthService } from 'modules/auth/auth.service'
// import { ClassworkService } from 'modules/classwork/classwork.service'
// import { ClassworkAssignment } from 'modules/classwork/models/ClassworkAssignment'
// import { OrgService } from 'modules/org/org.service'
// import { OrgOfficeService } from 'modules/orgOffice/orgOffice.service'

// import { ANY, Nullable, PageOptionsInput } from '../../types'

import { Question } from './models/Question'
import { QuestionChoice } from './models/QuestionChoice'
import { Quiz } from './models/Quiz'
import { QuizSubmit } from './models/QuizSubmit'

@Service()
export class QuizService {
  private readonly logger = new Logger(QuizService.name)

  constructor(
    @InjectModel(Question)
    private readonly questionModel: ReturnModelType<typeof Question>,

    @InjectModel(QuestionChoice)
    private readonly questionChoiceModel: ReturnModelType<
      typeof QuestionChoice
    >,
    @InjectModel(Quiz)
    private readonly quizModel: ReturnModelType<typeof Quiz>, // @Inject(forwardRef(() => OrgService)) // private readonly orgService: OrgService, // @Inject(forwardRef(() => AuthService)) // private readonly authService: AuthService, // @Inject(forwardRef(() => AccountService)) // private readonly accountService: AccountService, // @Inject(forwardRef(() => OrgOfficeService)) // private readonly orgOfficeService: OrgOfficeService, // @Inject(forwardRef(() => ClassworkService)) // private readonly classworkService: ClassworkService,
    @InjectModel(QuizSubmit)
    private readonly quizSubmitModel: ReturnModelType<typeof QuizSubmit>,
  ) {}

  async createQuestion(questionInput: {
    title: string
    scores: number
    questionChoicesTitle: string[]
    questionChoicesRight: boolean[]
    createdByAccountId: string
  }): Promise<DocumentType<Question>> {
    const {
      title,
      scores,
      questionChoicesTitle,
      questionChoicesRight,
      createdByAccountId,
    } = questionInput

    const question = await this.questionModel.create({
      title,
      scores,
      createdByAccountId,
    })

    const arrPromise = Promise.all(
      questionChoicesTitle.map(async (item, index) => {
        const questionChoice = await this.createQuestionChoice({
          title: item,
          isRight: questionChoicesRight[index],
          createdByAccountId,
          questionId: question.id,
        })
        return questionChoice
      }),
    )

    await arrPromise

    return question
  }

  async createQuestionChoice(questionChoiceInput: {
    title: string
    questionId: string
    isRight: boolean
    createdByAccountId: string
  }): Promise<DocumentType<QuestionChoice>> {
    const { title, questionId, isRight, createdByAccountId } =
      questionChoiceInput

    const questionChoice = await this.questionChoiceModel.create({
      title,
      questionId,
      isRight,
      createdByAccountId,
    })

    return questionChoice
  }

  async createQuiz(quizInput: {
    title: string
    description: string
    courseId: string
    questionIds?: string[]
    duration?: number
    createdByAccountId: string
    publicationState?: string
  }): Promise<DocumentType<Quiz>> {
    const {
      title,
      questionIds,
      courseId,
      description,
      duration,
      createdByAccountId,
      publicationState,
    } = quizInput

    const quiz = await this.quizModel.create({
      title,
      questionIds,
      courseId,
      description,
      duration,
      createdByAccountId,
      publicationState,
    })

    return quiz
  }

  async createQuizSubmit(quizInput: {
    quizId: string
    startTime: Date
    createdByAccountId: string
  }): Promise<DocumentType<QuizSubmit>> {
    const { quizId, startTime, createdByAccountId } = quizInput

    const quizSubmit = await this.quizSubmitModel.create({
      quizId,
      startTime,
      createdByAccountId,
    })

    return quizSubmit
  }

  async findAndPaginateQuiz(
    pageOptions: {
      limit: number
      skip: number
    },
    filter: {
      courseId: string
      publicationState?: Publication
    },
  ): Promise<{
    quizzes: DocumentType<Quiz>[]
    count: number
  }> {
    const { limit, skip } = pageOptions
    const { courseId, publicationState } = filter

    const quizModel = this.quizModel.find({
      courseId,
    })
    if (publicationState) {
      quizModel.find({
        publicationState,
      })
    }
    quizModel.sort({ _id: -1 }).skip(skip).limit(limit)
    const quizzes = await quizModel
    const count = await this.quizModel.countDocuments({ courseId })
    return { quizzes, count }
  }

  async findQuizById(id: string): Promise<Nullable<DocumentType<Quiz>>> {
    return this.quizModel.findById(id)
  }

  async findQuestionById(
    id: string,
  ): Promise<Nullable<DocumentType<Question>>> {
    return this.questionModel.findById(id)
  }

  async questionChoices(questionId: string): Promise<{
    questionChoices: DocumentType<QuestionChoice>[]
    idRight: string
  }> {
    const questionChoices = await this.questionChoiceModel.find({
      questionId,
    })

    const questionChoiceRight = await this.questionChoiceModel.findOne({
      questionId,
      isRight: true,
    })
    return { questionChoices, idRight: questionChoiceRight?.id }
  }

  async findOneQuizSubmit(
    quizId: string,
    createdByAccountId: string,
  ): Promise<Nullable<DocumentType<QuizSubmit>>> {
    return this.quizSubmitModel.findOne({
      quizId,
      createdByAccountId,
    })
  }

  async submitQuiz(input: {
    quizSubmitId: string
    questionIds: string[]
    questionChoiceIds: string[]
  }): Promise<Nullable<DocumentType<QuizSubmit>>> {
    const { quizSubmitId, questionIds, questionChoiceIds } = input
    const quizSubmits = await this.quizSubmitModel.findById(quizSubmitId)
    if (quizSubmits) {
      let scores = 0
      quizSubmits.questionIds = questionIds
      quizSubmits.questionChoiceIds = questionChoiceIds
      const arrPromise = Promise.all(
        questionIds.map(async (item, index) => {
          const question = await this.questionModel.findById(item)
          const questionChoice = await this.questionChoiceModel.findById(
            questionChoiceIds[index],
          )
          if (questionChoice?.isRight) {
            scores += question?.scores ?? 0
          }
        }),
      )
      await arrPromise
      quizSubmits.scores = scores
      const data = await quizSubmits.save()
      return data
    }
    return quizSubmits
  }
}