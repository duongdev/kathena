import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { createTestingModule, initTestDb } from 'core/utils/testing'

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

  // TODO: [BE] Implement ratingService.createRating

  // TODO:[BE] Implement ratingService.calculateAvgRatingByTargetId
})
