import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { objectId } from 'core/utils/db'
import { createTestingModule, initTestDb } from 'core/utils/testing'

import { AuthService } from '../auth/auth.service'
import { OrgService } from '../org/org.service'

import { OrgOfficeService } from './orgOffice.service'

describe('orgOffice.service', () => {
  let module: TestingModule
  let orgOfficeService: OrgOfficeService
  let orgService: OrgService
  let authService: AuthService
  let mongooseConnection: Connection

  beforeAll(async () => {
    const testDb = await initTestDb()
    mongooseConnection = testDb.mongooseConnection

    module = await createTestingModule(testDb.uri)

    orgOfficeService = module.get<OrgOfficeService>(OrgOfficeService)
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
    expect(orgOfficeService).toBeDefined()
  })

  describe('createOrgOffice', () => {
    const orgOfficeInput = {
      name: 'KMIN',
      address: 'ABC/1 XYZ',
      phone: '0987654321',
      createdByAccountId: objectId(),
      orgId: objectId(),
    }

    it('throws an error if orgId is invalid', async () => {
      expect.assertions(1)

      await expect(
        orgOfficeService.createOrgOffice(orgOfficeInput),
      ).rejects.toThrow('INVALID_ORG_ID')
    })

    it(`throws an error if account hasn't permission`, async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      await expect(
        orgOfficeService.createOrgOffice(orgOfficeInput),
      ).rejects.toThrow()
    })

    it(`throws an error if the name, phone number or address input is left blank`, async () => {
      expect.assertions(4)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(true as never)

      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(true as never)

      await expect(
        orgOfficeService.createOrgOffice({
          name: '',
          address: '25A Mai Thi Luu',
          phone: '0987654321',
          createdByAccountId: objectId(),
          orgId: objectId(),
        }),
      ).rejects.toThrow()

      await expect(
        orgOfficeService.createOrgOffice({
          name: 'Kmin',
          address: '',
          phone: '0987654321',
          createdByAccountId: objectId(),
          orgId: objectId(),
        }),
      ).rejects.toThrow()

      await expect(
        orgOfficeService.createOrgOffice({
          name: 'Kmin',
          address: '25A Mai Thi Luu',
          phone: '',
          createdByAccountId: objectId(),
          orgId: objectId(),
        }),
      ).rejects.toThrow()

      await expect(
        orgOfficeService.createOrgOffice({
          name: '',
          address: '',
          phone: '',
          createdByAccountId: objectId(),
          orgId: objectId(),
        }),
      ).rejects.toThrow()
    })

    it(`returns an orgOffice if the input is valid`, async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)

      await expect(
        orgOfficeService.createOrgOffice({
          name: 'Kmin',
          address: '25A Mai Thi Luu',
          phone: '0987654321',
          createdByAccountId: objectId(),
          orgId: objectId(),
        }),
      ).resolves.toMatchObject({
        name: 'Kmin',
        address: '25A Mai Thi Luu',
        phone: '0987654321',
      })
    })
  })
})
