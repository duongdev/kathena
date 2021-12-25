import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { Publication } from 'core'
import { objectId } from 'core/utils/db'
import { createTestingModule, initTestDb } from 'core/utils/testing'
import { AuthService } from 'modules/auth/auth.service'
import { CourseService } from 'modules/course/course.service'
import { QuizService } from 'modules/quiz/quiz.service'
import { ANY } from 'types'

describe('quiz.service', () => {
  let module: TestingModule
  let authService: AuthService
  let quizService: QuizService
  let courseService: CourseService
  let mongooseConnection: Connection

  beforeAll(async () => {
    const testDb = await initTestDb()
    mongooseConnection = testDb.mongooseConnection

    module = await createTestingModule(testDb.uri)

    authService = module.get<AuthService>(AuthService)
    quizService = module.get<QuizService>(QuizService)
    courseService = module.get<CourseService>(CourseService)
  })

  afterAll(async () => {
    await module.close()
  })

  beforeEach(async () => {
    await mongooseConnection.dropDatabase()
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  it('should be defined', () => {
    expect(quizService).toBeDefined()
  })

  const course: ANY = {
    id: objectId(),
    orgId: objectId(),
    name: 'NodeJs',
    code: 'NODEJS',
    startDate: new Date('2021-08-15'),
  }

  const createQuizInput: ANY = {
    title: 'Bài trắc nghiệm 1',
    description: 'Bài trắc nghiệm 15p',
    courseId: course.id,
    createdByAccountId: objectId(),
    publicationState: Publication.Draft,
    orgId: objectId(),
  }

  describe('publishAllQuizOfTheCourse', () => {
    it('throws error if course not found', async () => {
      expect.assertions(1)

      await expect(
        quizService.publishAllQuizOfTheCourse(
          objectId(),
          objectId(),
          objectId(),
        ),
      ).rejects.toThrowError('Khoá học không tồn tại!')
    })

    it(`throws error if account doesn't permission`, async () => {
      expect.assertions(1)

      jest.spyOn(courseService, 'findCourseById').mockResolvedValueOnce(course)

      await expect(
        quizService.publishAllQuizOfTheCourse(
          objectId(),
          objectId(),
          objectId(),
        ),
      ).rejects.toThrowError(
        'Tài khoản của bạn không có quyền quản lý khoá hoc này!',
      )
    })

    it('returns list lessons', async () => {
      expect.assertions(1)

      const createQuiz: ANY = {
        ...createQuizInput,
      }

      await quizService.createQuiz({
        ...createQuiz,
        title: 'Bài trắc nghiệm 1',
      })

      await quizService.createQuiz({
        ...createQuiz,
        title: 'Bài trắc nghiệm 2',
      })

      await quizService.createQuiz({
        ...createQuiz,
        title: 'Bài trắc nghiệm 3',
      })

      jest.spyOn(courseService, 'findCourseById').mockResolvedValueOnce(course)
      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true)

      await expect(
        quizService.publishAllQuizOfTheCourse(
          course.id,
          createQuiz.orgId,
          objectId(),
        ),
      ).resolves.toMatchObject([
        {
          title: 'Bài trắc nghiệm 1',
          publicationState: Publication.Published,
        },
        {
          title: 'Bài trắc nghiệm 2',
          publicationState: Publication.Published,
        },
        {
          title: 'Bài trắc nghiệm 3',
          publicationState: Publication.Published,
        },
      ])
    })
  })
})
