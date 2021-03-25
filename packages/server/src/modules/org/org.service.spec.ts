import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { objectId } from 'core/utils/db'
import { createTestingModule, initTestDb } from 'core/utils/testing'
import { ANY } from 'types'

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
    await mongooseConnection.dropDatabase()
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  it('should be defined', () => {
    expect(orgService).toBeDefined()
  })

  describe('createOrg', () => {
    it('throws error if org namespace existed', async () => {
      expect.assertions(2)

      jest
        .spyOn(orgService['orgModel'], 'exists')
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(true as never)

      await expect(
        orgService.createOrg({ name: 'name', namespace: 'namespace' }),
      ).rejects.toThrowError(`Org namespace existed`)

      await expect(
        orgService.createOrg({ name: 'name', namespace: 'name-space' }),
      ).rejects.toThrowError(`Org namespace existed`)
    })

    it('returns model org if created', async () => {
      expect.assertions(2)

      await expect(
        orgService.createOrg({
          name: 'name',
          namespace: 'test',
        }),
      ).resolves.toMatchObject({
        name: 'name',
        namespace: 'test',
      })

      await expect(
        orgService.createOrg({
          name: 'Dang Hieu Liem',
          namespace: 'test_1',
        }),
      ).resolves.toMatchObject({
        name: 'Dang Hieu Liem',
        namespace: 'test_1',
      })
    })
  })

  describe('existsOrgByNamespace', () => {
    it('returns true if exist org by namespace', async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService['orgModel'], 'exists')
        .mockResolvedValueOnce(true as never)

      await expect(orgService.existsOrgByNamespace('teststring')).resolves.toBe(
        true,
      )
    })

    it(`returns false if don't exist org by namespace`, async () => {
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
    it(`returns null if org namespace is empty`, async () => {
      expect.assertions(1)
      await expect(orgService.findOrgByNamespace('')).resolves.toBeNull()
    })

    it(`returns null if org namespace doesn't exist`, async () => {
      expect.assertions(1)
      await expect(
        orgService.findOrgByNamespace('nguyen van hai ne'),
      ).resolves.toBeNull()
    })

    it(`returns a valid org`, async () => {
      expect.assertions(1)

      const test: ANY = {
        id: objectId(),
        namespace: 'nguyenvanhai',
        name: 'nguyen van hai',
        orgId: objectId(),
      }

      jest.spyOn(orgService['orgModel'], 'findOne').mockResolvedValueOnce(test)
      await expect(
        orgService.findOrgByNamespace('nguyenvanhai'),
      ).resolves.toMatchObject({
        namespace: 'nguyenvanhai',
        name: 'nguyen van hai',
      })
    })
  })

  describe('findOrgById', () => {
    it('returns null if id does not exist or the input is an invalid string', async () => {
      expect.assertions(1)

      await expect(orgService.findOrgById(objectId())).resolves.toBeNull()
    })

    it('throws error if the input is an invalid string', async () => {
      expect.assertions(1)

      await expect(orgService.findOrgById('this is orgId')).rejects.toThrow()
    })

    it('returns org if id exists', async () => {
      expect.assertions(1)

      const org: ANY = {
        id: objectId(),
        namespace: 'kmin-edu',
        name: 'Kmin Academy',
        orgId: objectId(),
      }

      jest.spyOn(orgService['orgModel'], 'findById').mockResolvedValueOnce(org)

      await expect(orgService.findOrgById(org.orgId)).resolves.toMatchObject({
        namespace: 'kmin-edu',
        name: 'Kmin Academy',
      })
    })
  })

  describe('existsOrgById', () => {
    it(`returns false if id doesn't exist`, async () => {
      expect.assertions(1)

      await expect(orgService.existsOrgById(objectId())).resolves.toBe(false)
    })

    it(`throws error if the input is invalid string`, async () => {
      expect.assertions(1)

      await expect(orgService.existsOrgById('this is orgId')).rejects.toThrow()
    })

    it(`returns true if id exists`, async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService['orgModel'], 'exists')
        .mockResolvedValueOnce(true as never)

      await expect(orgService.existsOrgById(objectId())).resolves.toBe(true)
    })
  })
})
