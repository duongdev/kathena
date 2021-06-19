import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { createTestingModule, initTestDb } from 'core/utils/testing'

import { MailService } from './mail.service'

describe('MailService', () => {
  let module: TestingModule
  let mailService: MailService
  let mongooseConnection: Connection

  beforeAll(async () => {
    const testDb = await initTestDb()
    mongooseConnection = testDb.mongooseConnection

    module = await createTestingModule(testDb.uri)

    mailService = module.get<MailService>(MailService)
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
    expect(mailService).toBeDefined()
  })
})
