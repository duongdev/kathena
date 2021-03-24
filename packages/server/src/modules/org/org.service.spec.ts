import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { createTestingModule, initTestDb } from 'core/utils/testing'

import { objectId } from '../../core/utils/db'

import { Org } from './models/Org'
import { OrgService } from './org.service'

describe('org.service', () => {
  let module: TestingModule
  let orgService: OrgService
  let mongooseConnection: Connection

  beforeAll(async () => {
    const testDb = await initTestDb()
    mongooseConnection = testDb.mongooseConnection

    module = await createTestingModule(testDb.uri)

    orgService = module.get<OrgService>(OrgService)
  })

  afterAll(async () => {
    await module.close()
  })

  beforeEach(async () => {
    await module.close()
  })

  beforeEach(async () => {
    await mongooseConnection.dropDatabase()
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  it('should be defined', () => {
    expect(orgService).toBeDefined()
  })

  describe('existsOrgByNamespace', () => {
    it('Return true if exist org by namespace', async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService['orgModel'], 'exists')
        .mockResolvedValueOnce(true as never)

      await expect(orgService.existsOrgByNamespace('teststring')).resolves.toBe(
        true,
      )
    })

    it(`Return false if don't exist org by namespace`, async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService['orgModel'], 'exists')
        .mockResolvedValueOnce(false as never)

      await expect(orgService.existsOrgByNamespace('teststring')).resolves.toBe(
        false,
      )
    })
  })

  describe('findOrgByNamespace', () => {
    it(`return error if OrgByNamespace doesn't exist`, async () => {
      expect.assertions(1)

      await expect(orgService.findOrgByNamespace('')).resolves.toBeNull()
    })

    it(`returns a valid OrgByNamespace`, async () => {
      expect.assertions(1)

      const test: any = {
        id: objectId(),
        namespace: 'vanhai',
        name: 'nguyen van hai',
        orgId: objectId(),
      }

      jest.spyOn(orgService['orgModel'], 'findOne').mockResolvedValueOnce(test)
      await expect(
        orgService.findOrgByNamespace('vanhai'),
      ).resolves.toMatchObject({
        namespace: 'vanhai',
        name: 'nguyen van hai',
      })
    })
  })
})
