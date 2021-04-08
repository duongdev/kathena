import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { objectId } from 'core/utils/db'
import { createTestingModule, initTestDb } from 'core/utils/testing'
import { ANY } from 'types'

import { AccountService } from '../account/account.service'
import { OrgService } from '../org/org.service'

import { OrgOfficeService } from './orgOffice.service'
import { CreateOrgOfficeInput } from './orgOffice.types'

describe('orgOffice.service', () => {
  let module: TestingModule
  let orgOfficeService: OrgOfficeService
  let accountService: AccountService
  let orgService: OrgService
  let mongooseConnection: Connection

  beforeAll(async () => {
    const testDb = await initTestDb()
    mongooseConnection = testDb.mongooseConnection

    module = await createTestingModule(testDb.uri)

    orgOfficeService = module.get<OrgOfficeService>(OrgOfficeService)
    accountService = module.get<AccountService>(AccountService)
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
    expect(orgOfficeService).toBeDefined()
  })

  describe('findOrgOfficesByOrgId', () => {
    it('throws error if OrgId invalid', async () => {
      expect.assertions(1)

      jest
        .spyOn(orgOfficeService['orgService'], 'validateOrgId')
        .mockResolvedValueOnce(false as never)

      await expect(
        orgOfficeService.findOrgOfficesByOrgId(objectId()),
      ).rejects.toThrow('INVALID_ORG_ID')
    })

    it('returns an array valid OrgOfficesService', async () => {
      expect.assertions(1)

      const org = await orgService.createOrg({
        namespace: 'kmin-edu',
        name: 'Kmin Academy',
      })

      jest
        .spyOn(orgService['orgModel'], 'exists')
        .mockResolvedValueOnce(true as never)

      const listOrgOffices: ANY[] = []

      const account = await accountService.createAccount({
        orgId: org.id,
        email: 'nguyenvanhai0911@gmail.com',
        password: '123456',
        username: 'nguyenvanhai',
        roles: ['owner', 'admin'],
        displayName: 'Hai Nguyen',
      })

      const createOrgOfficeInput: CreateOrgOfficeInput = {
        name: 'Kmin Academy 1',
        address: '25A Mai Thi Luu',
        phone: '0973797634',
      }

      listOrgOffices.push(
        await orgOfficeService.createOrgOffice({
          ...createOrgOfficeInput,
          createdByAccountId: account.id,
          orgId: org.id,
        }),
      )

      listOrgOffices.push(
        await orgOfficeService.createOrgOffice({
          ...createOrgOfficeInput,
          createdByAccountId: account.id,
          orgId: org.id,
          name: 'Kmin Academy 2',
        }),
      )

      listOrgOffices.push(
        await orgOfficeService.createOrgOffice({
          ...createOrgOfficeInput,
          createdByAccountId: account.id,
          orgId: org.id,
          name: 'Kmin Academy 3',
        }),
      )

      jest
        .spyOn(orgOfficeService['orgService'], 'validateOrgId')
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(true as never)

      await expect(
        orgOfficeService.findOrgOfficesByOrgId(org.id),
      ).resolves.toMatchObject([
        {
          name: 'Kmin Academy 1',
          address: '25A Mai Thi Luu',
          phone: '0973797634',
        },
        {
          name: 'Kmin Academy 2',
          address: '25A Mai Thi Luu',
          phone: '0973797634',
        },
        {
          name: 'Kmin Academy 3',
          address: '25A Mai Thi Luu',
          phone: '0973797634',
        },
      ])
    })
  })

  describe('findOrgOfficeById', () => {
    it(`returns null if Id doesn't exist`, async () => {
      expect.assertions(1)

      await expect(
        orgOfficeService.findOrgOfficeById(objectId()),
      ).resolves.toBeNull()
    })

    it(`return OrgOffice if Id does exists`, async () => {
      expect.assertions(1)

      const org = await orgService.createOrg({
        namespace: 'kmin-edu',
        name: 'Kmin Academy',
      })

      jest
        .spyOn(orgService['orgModel'], 'exists')
        .mockResolvedValueOnce(true as never)

      const account = await accountService.createAccount({
        orgId: org.id,
        email: 'nguyenvanhai0911@gmail.com',
        password: '123456',
        username: 'nguyenvanhai',
        roles: ['owner', 'admin'],
        displayName: 'Hai Nguyen',
      })

      const createOrgOfficeInput = await orgOfficeService.createOrgOffice({
        name: 'Kmin Academy 1',
        address: '25A Mai Thi Luu',
        phone: '0973797634',
        orgId: org.id,
        createdByAccountId: account.id,
      })

      jest
        .spyOn(orgOfficeService['orgService'], 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      await expect(
        orgOfficeService.findOrgOfficeById(createOrgOfficeInput.id),
      ).resolves.toMatchObject({
        name: 'Kmin Academy 1',
        address: '25A Mai Thi Luu',
        phone: '0973797634',
      })
    })
  })
})
