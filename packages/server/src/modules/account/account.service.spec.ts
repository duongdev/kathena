import { TestingModule } from '@nestjs/testing'
import { compareSync } from 'bcrypt'
import { Connection } from 'mongoose'

import { objectId } from 'core/utils/db'
import { createTestingModule, initTestDb } from 'core/utils/testing'
import { ANY } from 'types'

import { AccountService } from './account.service'
import { CreateAccountServiceInput } from './account.type'
import { AccountStatus } from './models/Account'

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
        .spyOn(accountService['orgService'], 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      jest
        .spyOn(accountService['accountModel'], 'exists')
        .mockResolvedValueOnce(true as never)

      await expect(
        accountService.createAccount(createAccountServiceInput),
      ).rejects.toThrow('Email dustin.do95@gmail.com has been taken')
    })

    it(`throws error if orgId is not provided`, async () => {
      expect.assertions(3)

      jest
        .spyOn(accountService['orgService'], 'validateOrgId')
        .mockResolvedValueOnce(false as never)
        .mockResolvedValueOnce(false as never)
        .mockResolvedValueOnce(false as never)

      const testCreateAccountServiceInput: CreateAccountServiceInput = {
        ...createAccountServiceInput,
      }

      testCreateAccountServiceInput.orgId = ''

      await expect(
        accountService.createAccount(testCreateAccountServiceInput),
      ).rejects.toThrow('Org ID is invalid')

      testCreateAccountServiceInput.orgId = '                 '

      await expect(
        accountService.createAccount(testCreateAccountServiceInput),
      ).rejects.toThrow('Org ID is invalid')

      testCreateAccountServiceInput.orgId = ''

      await expect(
        accountService.createAccount(testCreateAccountServiceInput),
      ).rejects.toThrow('Org ID is invalid')
    })

    it(`throws error if orgId doesn't exist`, async () => {
      expect.assertions(1)

      jest
        .spyOn(accountService['orgService'], 'validateOrgId')
        .mockResolvedValueOnce(false as never)

      await expect(
        accountService.createAccount(createAccountServiceInput),
      ).rejects.toThrow('Org ID is invalid')
    })

    it(`sets default password as email`, async () => {
      expect.assertions(1)

      jest
        .spyOn(accountService['orgService'], 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      const testCreateAccountServiceInput: CreateAccountServiceInput = {
        ...createAccountServiceInput,
        password: '',
      }

      const testAccount = await accountService.createAccount(
        testCreateAccountServiceInput,
      )

      await expect(
        compareSync(testCreateAccountServiceInput.email, testAccount.password),
      ).toBe(true)
    })

    it(`sets default status as ACTIVE`, async () => {
      expect.assertions(1)

      jest
        .spyOn(accountService['orgService'], 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      const testAccount = await accountService.createAccount(
        createAccountServiceInput,
      )

      await expect(testAccount.status).toBe(AccountStatus.Active)
    })

    it.todo(`throws error if a staff creates staff or admin`)

    it.todo(`allows staff to create lecturer or student`)

    it.todo(`allows admin to create staff or admin`)

    it.todo(`replaces duplicated spaces in displayName by single spaces`)

    it.todo(`throws error if displayName contains invalid characters`)

    it(`encrypts the password`, async () => {
      expect.assertions(2)
      jest
        .spyOn(accountService['orgService'], 'validateOrgId')
        .mockResolvedValueOnce(true as never)

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

      jest
        .spyOn(accountService['orgService'], 'validateOrgId')
        .mockResolvedValueOnce(true as never)

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

  describe('findAndPaginateAccounts', () => {
    it('returns array account and count find and pagination account', async () => {
      expect.assertions(6)
      jest
        .spyOn(accountService['orgService'], 'validateOrgId')
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(true as never)

      const orgId1 = objectId()
      const orgId2 = objectId()
      const listCreatedAccountOrgId1: ANY[] = []
      const listCreatedAccountOrgId2: ANY[] = []

      const createAccountServiceInput: CreateAccountServiceInput = {
        orgId: orgId1,
        email: 'hieuliem33@gmail.com',
        password: '123456',
        username: 'hieuliem',
        roles: ['admin'],
        displayName: 'Yami Doki',
      }

      listCreatedAccountOrgId1.push(
        await accountService.createAccount({
          ...createAccountServiceInput,
          email: 'hieuliem331@gmail.com',
          username: 'hieuliem1',
          displayName: 'Yami Doki1',
        }),
      )

      listCreatedAccountOrgId1.push(
        await accountService.createAccount({
          ...createAccountServiceInput,
          email: 'hieuliem332@gmail.com',
          username: 'hieuliem2',
          displayName: 'Yami Doki2',
        }),
      )

      listCreatedAccountOrgId1.push(
        await accountService.createAccount({
          ...createAccountServiceInput,
          email: 'hieuliem333@gmail.com',
          username: 'hieuliem3',
          displayName: 'Yami Doki3',
        }),
      )

      listCreatedAccountOrgId1.push(
        await accountService.createAccount({
          ...createAccountServiceInput,
          email: 'hieuliem334@gmail.com',
          username: 'hieuliem4',
          displayName: 'Yami Doki4',
        }),
      )

      listCreatedAccountOrgId1.push(
        await accountService.createAccount({
          ...createAccountServiceInput,
          email: 'hieuliem335@gmail.com',
          username: 'hieuliem5',
          displayName: 'Yami Doki5',
        }),
      )

      listCreatedAccountOrgId2.push(
        await accountService.createAccount({
          ...createAccountServiceInput,
          orgId: orgId2,
        }),
      )

      listCreatedAccountOrgId2.push(
        await accountService.createAccount({
          ...createAccountServiceInput,
          orgId: orgId2,
          email: 'hieuliem331@gmail.com',
          username: 'hieuliem1',
          displayName: 'Yami Doki1',
        }),
      )

      await expect(
        accountService.findAndPaginateAccounts(
          {
            orgId: orgId1,
          },
          {
            limit: 2,
            skip: 2,
          },
        ),
      ).resolves.toMatchObject({
        accounts: [
          {
            email: 'hieuliem333@gmail.com',
            username: 'hieuliem3',
            displayName: 'Yami Doki3',
          },
          {
            email: 'hieuliem332@gmail.com',
            username: 'hieuliem2',
            displayName: 'Yami Doki2',
          },
        ],
        count: listCreatedAccountOrgId1.length,
      })

      await expect(
        accountService.findAndPaginateAccounts(
          {
            orgId: orgId1,
          },
          {
            limit: 3,
            skip: 2,
          },
        ),
      ).resolves.toMatchObject({
        accounts: [
          {
            email: 'hieuliem333@gmail.com',
            username: 'hieuliem3',
            displayName: 'Yami Doki3',
          },
          {
            email: 'hieuliem332@gmail.com',
            username: 'hieuliem2',
            displayName: 'Yami Doki2',
          },
          {
            email: 'hieuliem331@gmail.com',
            username: 'hieuliem1',
            displayName: 'Yami Doki1',
          },
        ],
        count: listCreatedAccountOrgId1.length,
      })

      await expect(
        accountService.findAndPaginateAccounts(
          {
            orgId: orgId1,
          },
          {
            limit: 1,
            skip: 0,
          },
        ),
      ).resolves.toMatchObject({
        accounts: [
          {
            email: 'hieuliem335@gmail.com',
            username: 'hieuliem5',
            displayName: 'Yami Doki5',
          },
        ],
        count: listCreatedAccountOrgId1.length,
      })

      await expect(
        accountService.findAndPaginateAccounts(
          {
            orgId: orgId2,
          },
          {
            limit: 2,
            skip: 0,
          },
        ),
      ).resolves.toMatchObject({
        accounts: [
          {
            email: 'hieuliem331@gmail.com',
            username: 'hieuliem1',
            displayName: 'Yami Doki1',
          },
          {
            email: 'hieuliem33@gmail.com',
            username: 'hieuliem',
            displayName: 'Yami Doki',
          },
        ],
        count: listCreatedAccountOrgId2.length,
      })

      await expect(
        accountService.findAndPaginateAccounts(
          {
            orgId: orgId2,
          },
          {
            limit: 0,
            skip: 0,
          },
        ),
      ).resolves.toMatchObject({
        accounts: [
          {
            email: 'hieuliem331@gmail.com',
            username: 'hieuliem1',
            displayName: 'Yami Doki1',
          },
          {
            email: 'hieuliem33@gmail.com',
            username: 'hieuliem',
            displayName: 'Yami Doki',
          },
        ],
        count: listCreatedAccountOrgId2.length,
      })

      await expect(
        accountService.findAndPaginateAccounts(
          {
            orgId: orgId2,
          },
          {
            limit: 0,
            skip: 1,
          },
        ),
      ).resolves.toMatchObject({
        accounts: [
          {
            email: 'hieuliem33@gmail.com',
            username: 'hieuliem',
            displayName: 'Yami Doki',
          },
        ],
        count: listCreatedAccountOrgId2.length,
      })
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

      jest
        .spyOn(accountService['orgService'], 'validateOrgId')
        .mockResolvedValueOnce(true as never)

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
    it(`returns null if Id doesn't exist`, async () => {
      expect.assertions(1)

      await expect(
        accountService.findAccountById('60536101b803f71a85798c77'),
      ).resolves.toBeNull()
    })

    it(`returns Account information if Id exists`, async () => {
      expect.assertions(1)
      jest
        .spyOn(accountService['orgService'], 'validateOrgId')
        .mockResolvedValueOnce(true as never)

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

  describe('existsOrgByNamespace', () => {})
})
