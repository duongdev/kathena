import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { objectId } from 'core/utils/db'
import { createTestingModule, initTestDb } from 'core/utils/testing'
import { ANY } from 'types'

import { RatingService } from './rating.service'

describe('rating.service', () => {
  let module: TestingModule
  let ratingService: RatingService
  let mongooseConnection: Connection

  beforeAll(async () => {
    const testDb = await initTestDb()
    mongooseConnection = testDb.mongooseConnection

    module = await createTestingModule(testDb.uri)

    ratingService = module.get<RatingService>(RatingService)
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

      await expect(
        ratingService.createRating(objectId(), objectId(), createRatingInput),
      ).resolves.toMatchObject({
        numberOfStars: 5,
        targetId: createRatingInput.targetId,
      })
    })
  })

  describe('calculateAvgRatingByTargetId', () => {
    it('returns the average number of stars by targetId', async () => {
      expect.assertions(1)

      const targetId = objectId()
      const dataArrayOfTargetId: ANY = [
        {
          id: targetId,
          numberOfStars: 5,
        },
        {
          id: targetId,
          numberOfStars: 4,
        },
        {
          id: targetId,
          numberOfStars: 4,
        },
      ]

      jest
        .spyOn(ratingService['ratingModel'], 'find')
        .mockResolvedValueOnce(dataArrayOfTargetId)

      await expect(
        ratingService.calculateAvgRatingByTargetId(objectId(), targetId),
      ).resolves.toEqual(4.3)
    })
  })
})
