import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { objectId, Publication } from 'core'
import { createTestingModule, initTestDb } from 'core/utils/testing'
import { ANY } from 'types'

import { ClassworkService } from './classwork.service'
import { UpdateClassworkMaterialInput } from './classwork.type'

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

  it('should be defined', () => {
    expect(classworkService).toBeDefined()
  })

  /**
   * START CLASSWORK MATERIAL
   */

  describe('ClassWorkMaterial', () => {
    // TODO: Delete this line and start the code here
    describe('updateClassworkMaterial', () => {
      const updateClassworkMaterialInput: UpdateClassworkMaterialInput = {
        title: 'title',
        description: 'description',
        publicationState: Publication.Draft,
      }

      it(`throws error if orgId invalid`, async () => {
        expect.assertions(1)

        await expect(
          classworkService.updateClassworkMaterial(
            objectId(),
            objectId(),
            objectId(),
            objectId(),
            updateClassworkMaterialInput,
          ),
        ).rejects.toThrowError(`ORG_ID_INVALID`)
      })

      it(`throws error if accountId invalid`, async () => {
        expect.assertions(1)
        jest
          .spyOn(classworkService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as ANY)

        await expect(
          classworkService.updateClassworkMaterial(
            objectId(),
            objectId(),
            objectId(),
            objectId(),
            updateClassworkMaterialInput,
          ),
        ).rejects.toThrowError(`ACCOUNT_ID_INVALID`)
      })

      it.todo(`throws error if account can't manage course`)

      it.todo(`throws error if classworkMaterialId invalid`)

      it.todo(`returns a updated classworkMaterial`)
    })
  })
  /**
   * END CLASSWORK MATERIAL
   */

  /**
   * START CLASSWORK ASSIGNMENTS
   */

  // TODO: Delete this line and start the code here

  /**
   * END CLASSWORK ASSIGNMENTS
   */
})
