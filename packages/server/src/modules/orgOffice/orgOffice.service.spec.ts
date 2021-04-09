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

  describe('updateOrgOffice', () => {
    it('throws error if OrgId invalid', async () => {
      expect.assertions(1)

      await expect(
        orgOfficeService.updateOrgOffice({
          id: objectId(),
          name: 'Học viện khoa học máy tính kmin',
          address: '25A Mai Thi Luu',
          phone: '0973797634',
          updatedByAccountId: objectId(),
          orgId: objectId(),
        }),
      ).rejects.toThrowError('INVALID_ORG_ID')
    })

    it('returns the updated OrgOffice', async () => {
      expect.assertions(4)

      jest
        .spyOn(orgOfficeService['orgService'], 'validateOrgId')
        .mockResolvedValue(true as never)

      jest
        .spyOn(orgOfficeService['authService'], 'accountHasPermission')
        .mockResolvedValue(true as never)

      const orgId = await orgService.createOrg({
        name: 'A',
        namespace: 'admin-a',
      })

      const orgOffice = await orgOfficeService.createOrgOffice({
        name: 'Kmin Academy',
        address: '25A Mai Thi Luu',
        phone: '0973797634',
        createdByAccountId: objectId(),
        orgId: orgId.id,
      })

      await expect(
        orgOfficeService.updateOrgOffice({
          id: orgOffice.id,
          name: 'Học viện khoa học máy tính kmin',
          address: '25A Mai Thi Luu',
          phone: '0973797634',
          updatedByAccountId: objectId(),
          orgId: orgId.id,
        }),
      ).resolves.toMatchObject({
        name: 'Học viện khoa học máy tính kmin',
        address: '25A Mai Thi Luu',
        phone: '0973797634',
      })

      await expect(
        orgOfficeService.updateOrgOffice({
          id: orgOffice.id,
          name: 'Học viện khoa học máy tính kmin',
          address: 'Tần 81 landmark 81',
          phone: '0973797634',
          updatedByAccountId: objectId(),
          orgId: orgId.id,
        }),
      ).resolves.toMatchObject({
        name: 'Học viện khoa học máy tính kmin',
        address: 'Tần 81 landmark 81',
        phone: '0973797634',
      })

      await expect(
        orgOfficeService.updateOrgOffice({
          id: orgOffice.id,
          name: 'Học viện khoa học máy tính kmin',
          address: 'Tần 81 landmark 81',
          phone: '0388889999',
          updatedByAccountId: objectId(),
          orgId: orgId.id,
        }),
      ).resolves.toMatchObject({
        name: 'Học viện khoa học máy tính kmin',
        address: 'Tần 81 landmark 81',
        phone: '0388889999',
      })

      await expect(
        orgOfficeService.updateOrgOffice({
          id: orgOffice.id,
          name: 'Kmin Academy Học viện khoa học máy tính',
          address: 'Tần 69 tòa nhà Bitexco',
          phone: '0388888888',
          updatedByAccountId: objectId(),
          orgId: orgId.id,
        }),
      ).resolves.toMatchObject({
        name: 'Kmin Academy Học viện khoa học máy tính',
        address: 'Tần 69 tòa nhà Bitexco',
        phone: '0388888888',
      })
    })

    it(`throws error if can't update OrgOffice`, async () => {
      expect.assertions(1)

      jest
        .spyOn(orgOfficeService['orgService'], 'validateOrgId')
        .mockResolvedValue(true as never)

      jest
        .spyOn(orgOfficeService['authService'], 'accountHasPermission')
        .mockResolvedValue(true as never)

      await expect(
        orgOfficeService.updateOrgOffice({
          id: objectId(),
          name: 'Học viện khoa học máy tính kmin',
          address: '25A Mai Thi Luu',
          phone: '0973797634',
          updatedByAccountId: objectId(),
          orgId: objectId(),
        }),
      ).rejects.toThrowError(`CAN'T_UPDATE_ORG_OFFICE`)
    })
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
})
