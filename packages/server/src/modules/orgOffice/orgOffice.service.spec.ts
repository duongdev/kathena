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

  describe('findOrgOffices', () => {
    it('abc', async () => {
      expect.assertions(1)

      const org = await orgService.createOrg({
        namespace: 'kmin-edu',
        name: 'Kmin Academy',
      })

      const account = await accountService.createAccount({
        orgId: org.id,
        email: 'huynhthanhcanh.top@gmail.com',
        password: '123456',
        username: 'canhhuynh',
        roles: ['owner', 'admin'],
        displayName: 'Thanh Canh',
      })

      const listOrgService: ANY[] = []

      const createOrgOfficeInput: CreateOrgOfficeInput = {
        name: 'KMIN',
        address: '25A Mai Thi Luu',
        phone: '0987654321',
      }

      listOrgService.push(
        await orgOfficeService.createOrgOffice({
          ...createOrgOfficeInput,
          name: 'ABC',
          createdByAccountId: account.id,
          orgId: org.id,
        }),
      )

      listOrgService.push(
        await orgOfficeService.createOrgOffice({
          ...createOrgOfficeInput,
          name: 'XYZ',
          createdByAccountId: account.id,
          orgId: org.id,
        }),
      )

      listOrgService.push(
        await orgOfficeService.createOrgOffice({
          ...createOrgOfficeInput,
          name: 'ABG',
          createdByAccountId: account.id,
          orgId: org.id,
        }),
      )

      await expect(
        orgOfficeService.findOrgOfficesByName('AB'),
      ).resolves.toBeNull()
    })
  })
})
