import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { createTestingModule, initTestDb } from 'core/utils/testing'

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

  describe('createOrg', () => {
    it.todo('throws error if org name existed')

    it.todo('throws error if org name invalid')

    it('throws error if org namespace existed', async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService['orgModel'], 'exists')
        .mockResolvedValueOnce(true as never)

      await expect(
        orgService.createOrg({ name: 'name', namespace: 'namespace' }),
      ).rejects.toThrowError(`Org namespace existed`)
    })

    it('throws error if org namespace invalid', async () => {
      expect.assertions(1)

      await expect(
        orgService.createOrg({ name: 'name', namespace: 'asvs' }),
      ).rejects.toThrowError(`Org namespace existed`)
    })

    it.todo('return model org if created', async () => {
      expect.assertions(1)

      await expect(
        orgService.createOrg({ name: 'name', namespace: 'asvs' }),
      ).rejects.toThrowError(`Org namespace existed`)
    })
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
})
