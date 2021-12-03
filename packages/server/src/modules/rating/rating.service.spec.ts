import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { Publication } from 'core'
import { objectId } from 'core/utils/db'
import { createTestingModule, initTestDb } from 'core/utils/testing'
import { AuthService } from 'modules/auth/auth.service'
import { CourseService } from 'modules/course/course.service'
import { LessonService } from 'modules/lesson/lesson.service'
import { OrgService } from 'modules/org/org.service'
import { ANY } from 'types'

import { RatingService } from './rating.service'

describe('rating.service', () => {
  let module: TestingModule
  let ratingService: RatingService
  let courseService: CourseService
  let orgService: OrgService
  let authService: AuthService
  let lessonService: LessonService
  let mongooseConnection: Connection

  beforeAll(async () => {
    const testDb = await initTestDb()
    mongooseConnection = testDb.mongooseConnection

    module = await createTestingModule(testDb.uri)

    ratingService = module.get<RatingService>(RatingService)
    courseService = module.get<CourseService>(CourseService)
    orgService = module.get<OrgService>(OrgService)
    authService = module.get<AuthService>(AuthService)
    lessonService = module.get<LessonService>(LessonService)
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
    expect(ratingService).toBeDefined()
  })

  describe('createRating', () => {
    const createRatingInput: ANY = {
      targetId: objectId(),
      numberOfStars: 5,
    }

    it('returns new rating', async () => {
      expect.assertions(1)

      jest
        .spyOn(ratingService, 'calculateAvgRatingByTargetId')
        .mockResolvedValueOnce(4.5)

      const expectRating = await ratingService.createRating(
        objectId(),
        objectId(),
        createRatingInput,
      )

      const resultForExpectRating = {
        numberOfStars: expectRating.numberOfStars,
        targetId: expectRating.targetId,
      }

      const data = {
        numberOfStars: 5,
        targetId: createRatingInput.targetId,
      }

      expect(
        JSON.stringify(resultForExpectRating) === JSON.stringify(data),
      ).toBeTruthy()
    })
  })

  describe('createRatingForTheLesson', () => {
    const createRatingInput: ANY = {
      targetId: objectId(),
      numberOfStars: 5,
    }

    it('throws new error if account has no permissions', async () => {
      expect.assertions(1)

      jest
        .spyOn(ratingService, 'calculateAvgRatingByTargetId')
        .mockResolvedValueOnce(4.5)

      await expect(
        ratingService.createRatingForTheLesson(
          objectId(),
          objectId(),
          createRatingInput,
        ),
      ).rejects.toThrowError(
        `Access denied! You don't have permission for this action!`,
      )
    })

    it('returns new rating', async () => {
      expect.assertions(1)

      jest.spyOn(authService, 'canSubmitRating').mockResolvedValueOnce(true)
      jest
        .spyOn(ratingService, 'calculateAvgRatingByTargetId')
        .mockResolvedValueOnce(4.5)

      const expectRating = await ratingService.createRating(
        objectId(),
        objectId(),
        createRatingInput,
      )

      const resultForExpectRating = {
        numberOfStars: expectRating.numberOfStars,
        targetId: expectRating.targetId,
      }

      const data = {
        numberOfStars: 5,
        targetId: createRatingInput.targetId,
      }

      expect(
        JSON.stringify(resultForExpectRating) === JSON.stringify(data),
      ).toBeTruthy()
    })
  })

  describe('calculateAvgRatingByTargetId', () => {
    const course: ANY = {
      id: objectId(),
      orgId: objectId(),
      name: 'NodeJs',
      code: 'NODEJS',
    }

    it('returns the average number of stars by targetId', async () => {
      expect.assertions(1)

      const date = new Date()

      const createLessonInput: ANY = {
        startTime: date.setDate(date.getDate() + 1),
        endTime: date.setDate(date.getDate() + 1),
        description: 'Day la buoi 1',
        courseId: course.id,
        publicationState: Publication.Published,
      }

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(courseService['courseModel'], 'findById')
        .mockResolvedValueOnce(course)
      jest
        .spyOn(ratingService['ratingModel'], 'countDocuments')
        .mockResolvedValueOnce(3)
      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true)

      const lesson = await lessonService.createLesson(
        course.orgId,
        objectId(),
        createLessonInput,
      )

      // (5 + 4)/2
      lesson.avgNumberOfStars = 4.5
      await lesson.save()

      // (5 + 4 + 4)/3
      await expect(
        ratingService.calculateAvgRatingByTargetId(course.orgId, lesson.id, 4),
      ).resolves.toEqual((4.5 * 2 + 4) / 3)
    })
  })

  describe('findOneRating', () => {
    it('returns rating', async () => {
      expect.assertions(1)

      const accountId = objectId()
      const orgId = objectId()

      const createRatingInput: ANY = {
        targetId: objectId(),
        numberOfStars: 5,
      }

      jest.spyOn(authService, 'canSubmitRating').mockResolvedValueOnce(true)
      jest
        .spyOn(ratingService, 'calculateAvgRatingByTargetId')
        .mockResolvedValueOnce(4.5)

      await ratingService.createRating(orgId, accountId, createRatingInput)

      await expect(
        ratingService.findOneRating(
          accountId,
          createRatingInput.targetId,
          orgId,
        ),
      ).resolves.toMatchObject({
        numberOfStars: createRatingInput.numberOfStars,
      })
    })
  })
})
