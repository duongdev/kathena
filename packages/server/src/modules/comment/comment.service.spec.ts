import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { createTestingModule, initTestDb } from 'core/utils/testing'

import { CommentService } from './comment.service'

describe('comment.service', () => {
  let module: TestingModule
  let commentService: CommentService
  let mongooseConnection: Connection

  beforeAll(async () => {
    const testDb = await initTestDb()
    mongooseConnection = testDb.mongooseConnection

    module = await createTestingModule(testDb.uri)

    commentService = module.get<CommentService>(CommentService)
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
    expect(commentService).toBeDefined()
  })

  // TODO: Implement createComment unit test

  // TODO: Implement listCommentByTargetId unit test
})
