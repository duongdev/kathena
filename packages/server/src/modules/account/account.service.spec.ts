import { TestingModule } from '@nestjs/testing'
import { compareSync } from 'bcrypt'
import { Connection } from 'mongoose'

import { objectId } from 'core/utils/db'
import { createTestingModule, initTestDb } from 'core/utils/testing'

import { AccountService } from './account.service'
import { CreateAccountServiceInput } from './account.type'

describe('account.service', () => {
  let module: TestingModule
  let accountService: AccountService
  let mongooseConnection: Connection

  beforeAll(async () => {
    const testDb = await initTestDb()
    mongooseConnection = testDb.mongooseConnection

    module = await createTestingModule(testDb.uri)

    accountService = module.get<AccountService>(AccountService)
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
    expect(accountService).toBeDefined()
  })

  describe('createAccount', () => {
    const createAccountServiceInput: CreateAccountServiceInput = {
      orgId: objectId(),
      email: 'dustin.do95@gmail.com',
      password: '123456',
      username: 'duongdev',
      roles: ['owner', 'admin', 'admin'],
      displayName: 'Dustin Do',
    }

    it(`throws error if username or email has been taken`, async () => {
      expect.assertions(1)

      jest
        .spyOn(accountService['accountModel'], 'exists')
        .mockResolvedValueOnce(true as never)

      await expect(
        accountService.createAccount(createAccountServiceInput),
      ).rejects.toThrow('Email dustin.do95@gmail.com has been taken')
    })

    it.todo(`throws error if orgId is not provided`)

    it.todo(`throws error if orgId doesn't exist`)

    it.todo(`sets default password as email`)

    it.todo(`sets default status as ACTIVE`)

    it.todo(`throws error if a staff creates staff or admin`)

    it.todo(`allows staff to create lecturer or student`)

    it.todo(`allows admin to create staff or admin`)

    it.todo(`replaces duplicated spaces in displayName by single spaces`)

    it.todo(`throws error if displayName contains invalid characters`)

    it(`encrypts the password`, async () => {
      expect.assertions(2)
      const account = await accountService.createAccount(
        createAccountServiceInput,
      )

      expect(account.password).not.toBe(createAccountServiceInput.password)
      expect(
        compareSync(createAccountServiceInput.password, account.password),
      ).toBe(true)
    })

    it(`returns the created account`, async () => {
      expect.assertions(3)

      const account = await accountService.createAccount(
        createAccountServiceInput,
      )

      expect(account).toMatchObject({
        email: 'dustin.do95@gmail.com',
        lastActivityAt: null,
        status: 'Active',
        username: 'duongdev',
      })
      expect(account.orgId).toBeDefined()
      expect(account.roles.length).toBe(2) // removes duplicated roles
    })
  })

  describe('findAccountByUsernameOrEmail', () => {
    it(`returns null if neither usernameOrEmail or orgId is provided`, async () => {
      expect.assertions(1)

      await expect(
        accountService.findAccountByUsernameOrEmail({
          orgId: 'tao_lao',
          usernameOrEmail: 'not_exist',
        }),
      ).resolves.toBeNull()
    })

    it(`return null if nothing found`, async () => {
      expect.assertions(1)

      const result = await accountService.findAccountByUsernameOrEmail({
        orgId: objectId(),
        usernameOrEmail: 'not_exist',
      })

      expect(result).toBeNull()
    })

    it(`be able to find by username or email`, async () => {
      expect.assertions(2)

      const account = await accountService.createAccount({
        username: 'duongdev',
        email: 'dustin.do95@gmail.com',
        password: 'rawPass',
        orgId: objectId(),
        roles: ['admin'],
        displayName: 'Dustin Do',
      })

      await expect(
        accountService.findAccountByUsernameOrEmail({
          orgId: account.orgId,
          usernameOrEmail: 'duongdev',
        }),
      ).resolves.toMatchObject({
        id: account.id,
        username: 'duongdev',
        email: 'dustin.do95@gmail.com',
        orgId: account.orgId,
      })

      await expect(
        accountService.findAccountByUsernameOrEmail({
          orgId: account.orgId,
          usernameOrEmail: 'dustin.do95@gmail.com',
        }),
      ).resolves.toMatchObject({
        id: account.id,
        username: 'duongdev',
        email: 'dustin.do95@gmail.com',
        orgId: account.orgId,
      })
    })
  })

  describe('findAccountById', () => {
    it(`returns nul if Id doesn't exist`, async () => {
      expect.assertions(1)

      await expect(
        accountService.findAccountById('60536101b803f71a85798c77'),
      ).resolves.toBeNull()
    })

    it('return Account information if Id exists', async () => {
      expect.assertions(1)

      const account = await accountService.createAccount({
        username: 'canhhuynh',
        email: 'huynhthanhcanh.top@gmail.com',
        password: 'rawPass',
        orgId: objectId(),
        roles: ['admin'],
        displayName: 'Canh Huynh',
      })

      await expect(
        accountService.findAccountById(account.id),
      ).resolves.toMatchObject({
        id: account.id,
        username: 'canhhuynh',
        email: 'huynhthanhcanh.top@gmail.com',
        orgId: account.orgId,
      })
    })
  })
})
