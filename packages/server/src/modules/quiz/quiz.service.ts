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

  async findAndPaginateQuizSubmit(
    pageOptions: {
      limit: number
      skip: number
    },
    filter: {
      quizId: string
    },
  ): Promise<{
    quizSubmits: DocumentType<QuizSubmit>[]
    count: number
  }> {
    const { limit, skip } = pageOptions
    const { quizId } = filter

    const quizSubmitModel = this.quizSubmitModel.find({
      quizId,
    })

    quizSubmitModel.sort({ _id: -1 }).skip(skip).limit(limit)
    const quizSubmits = await quizSubmitModel
    const count = await this.quizModel.countDocuments({ quizId })
    return { quizSubmits, count }
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

  async findQuizSubmitById(
    quizSubmitId: string,
  ): Promise<Nullable<DocumentType<QuizSubmit>>> {
    return this.quizSubmitModel.findById(quizSubmitId)
  }

  async updatePublicationQuiz(
    id: string,
    publicationState: Publication,
  ): Promise<Nullable<DocumentType<Quiz>>> {
    const quiz = await this.quizModel.findById(id)
    if (quiz) {
      quiz.publicationState = publicationState
      const update = await quiz?.save()
      return update
    }
    return quiz
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

  async cloneQuizzes(input: {
    newCourseId: string
    creatorId: string
    oldCourseId: string
    orgId: string
  }): Promise<DocumentType<Quiz>[]> {
    this.logger.log(`[${this.cloneQuizzes.name}] cloning ...`)
    this.logger.log(input)

    const { newCourseId, creatorId, oldCourseId, orgId } = input

    const quizzesFormOldCourse = await this.quizModel.find({
      courseId: oldCourseId,
    })

    const quizzes = await Promise.all(
      quizzesFormOldCourse.map(
        async (quiz: Quiz): Promise<DocumentType<Quiz>> => {
          const questionIds: string[] = await Promise.all(
            quiz.questionIds.map(
              async (questionId: string): Promise<string> => {
                const newQuestion = await this.cloneQuestion({
                  creatorId,
                  orgId,
                  questionId,
                })

                return newQuestion.id
              },
            ),
          )

          const createInput = {
            courseId: newCourseId,
            createdByAccountId: creatorId,
            description: quiz.description ? quiz.description : '',
            title: quiz.title,
            duration: quiz.duration,
            publicationState: Publication.Draft,
            questionIds,
            orgId,
          }
          return this.quizModel.create(createInput)
        },
      ),
    )

    this.logger.log(`[${this.cloneQuizzes.name}] cloned !`)
    this.logger.verbose(quizzes)
    return quizzes
  }

  async cloneQuestion(input: {
    questionId: string
    orgId: string
    creatorId: string
  }): Promise<Question> {
    this.logger.log(`[${this.cloneQuestion.name}] cloning ...`)
    this.logger.log(input)
    const { questionId, orgId, creatorId } = input
    const question = await this.findQuestionById(questionId)

    if (!question) {
      throw new Error('Câu hỏi không tồn tạo')
    }

    const newQuestion = await this.questionModel.create({
      title: question.title,
      scores: question.scores,
      createdByAccountId: creatorId,
      orgId,
    })

    await this.cloneQuestionChoices({
      creatorId,
      newQuestionId: newQuestion.id,
      oldQuestionId: questionId,
      orgId,
    })

    this.logger.log(`[${this.cloneQuestion.name}] cloned !`)
    this.logger.verbose(newQuestion)
    return newQuestion
  }

  async cloneQuestionChoices(input: {
    oldQuestionId: string
    orgId: string
    creatorId: string
    newQuestionId: string
  }): Promise<QuestionChoice[]> {
    this.logger.log(`[${this.cloneQuestionChoices.name}] cloning ...`)
    this.logger.log(input)

    const { oldQuestionId, creatorId, newQuestionId } = input

    const questionChoices: QuestionChoice[] =
      await this.questionChoiceModel.find({
        questionId: oldQuestionId,
      })

    const newQuestionChoices = await Promise.all(
      questionChoices.map(async (questionChoice): Promise<QuestionChoice> => {
        return this.createQuestionChoice({
          createdByAccountId: creatorId,
          isRight: questionChoice.isRight,
          questionId: newQuestionId,
          title: questionChoice.title,
        })
      }),
    )

    this.logger.log(`[${this.cloneQuestionChoices.name}] cloned !`)
    this.logger.verbose(newQuestionChoices)
    return newQuestionChoices
  }
}
