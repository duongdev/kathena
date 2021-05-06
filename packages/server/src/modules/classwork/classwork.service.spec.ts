import { TestingModule } from '@nestjs/testing'
import { compareSync } from 'bcrypt'
import { Connection } from 'mongoose'

import { objectId } from 'core/utils/db'
import { createTestingModule, initTestDb } from 'core/utils/testing'
import { Role } from 'modules/auth/models'
import { ANY } from 'types'

import { ClassworkService } from './classwork.service'

describe('classwork.service', () => {
  let module: TestingModule
  let classworkService: ClassworkService
  let mongooseConnection: Connection

  beforeAll(async () => {
    const testDb = await initTestDb()
    mongooseConnection = testDb.mongooseConnection

    module = await createTestingModule(testDb.uri)

    classworkService = module.get<ClassworkService>(ClassworkService)
  })

  afterAll(async () => {
    await module.close()
  })

  beforeEach(async () => {
    await mongooseConnection.dropDatabase()
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  /**
   * START CLASSWORK
   */

  // TODO: Delete this line and start the code here

  /**
   * END CLASSWORK
   */
})
