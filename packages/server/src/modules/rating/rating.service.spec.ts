import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { Publication } from 'core'
import { objectId } from 'core/utils/db'
import { createTestingModule, initTestDb } from 'core/utils/testing'
import { AcademicService } from 'modules/academic/academic.service'
import { AuthService } from 'modules/auth/auth.service'
import { OrgService } from 'modules/org/org.service'
import { ANY } from 'types'

import { RatingService } from './rating.service'

describe('rating.service', () => {
  let module: TestingModule
  let ratingService: RatingService
  let academicService: AcademicService
  let orgService: OrgService
  let authService: AuthService
  let mongooseConnection: Connection

  beforeAll(async () => {
    const testDb = await initTestDb()
    mongooseConnection = testDb.mongooseConnection

    module = await createTestingModule(testDb.uri)

    ratingService = module.get<RatingService>(RatingService)
    academicService = module.get<AcademicService>(AcademicService)
    orgService = module.get<OrgService>(OrgService)
    authService = module.get<AuthService>(AuthService)
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

      const createLessonInput: ANY = {
        startTime: new Date('2021-08-15 14:00'),
        endTime: new Date('2021-08-15 16:30'),
        description: 'Day la buoi 1',
        courseId: course.id,
        publicationState: Publication.Published,
      }

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(academicService['courseModel'], 'findById')
        .mockResolvedValueOnce(course)
      jest
        .spyOn(ratingService['ratingModel'], 'countDocuments')
        .mockResolvedValueOnce(3)
      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true)

      const lesson = await academicService.createLesson(
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
})
