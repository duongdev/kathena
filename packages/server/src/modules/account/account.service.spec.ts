import { TestingModule } from '@nestjs/testing'
import { compareSync } from 'bcrypt'
import { Connection } from 'mongoose'

import { objectId } from 'core/utils/db'
import { createTestingModule, initTestDb } from 'core/utils/testing'
import { Role } from 'modules/auth/models'
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

  describe('createOrgMemberAccount', () => {
    const createAccountServiceInput: ANY = {
      orgId: objectId(),
      email: 'nguyenvanhai141911@gmail.com',
      password: '12345678',
      username: 'nguyenvanhai',
      roles: ['owner', 'admin'],
      displayName: 'Nguyen Van Hai',
    }

    const arrRole: Role[] = [
      {
        name: 'admin',
        priority: 2,
        permissions: [],
      },
      {
        name: 'owner',
        priority: 1,
        permissions: [],
      },
      {
        name: 'staff',
        priority: 3,
        permissions: [],
      },
      {
        name: 'lecturer',
        priority: 4,
        permissions: [],
      },
      {
        name: 'student',
        priority: 5,
        permissions: [],
      },
    ]

    it(`throws error if can't Create Member`, async () => {
      expect.assertions(1)

      jest
        .spyOn(accountService['authService'], 'mapOrgRolesFromNames')
        .mockResolvedValueOnce(arrRole)

      jest
        .spyOn(accountService['authService'], 'canAccountManageRoles')
        .mockResolvedValueOnce(false as never)

      await expect(
        accountService.createOrgMemberAccount(
          createAccountServiceInput.orgId,
          createAccountServiceInput,
        ),
      ).rejects.toThrow('TARGET_ROLES_FORBIDDEN')
    })

    it(`returns account if createdAccount`, async () => {
      expect.assertions(1)

      jest
        .spyOn(accountService['authService'], 'mapOrgRolesFromNames')
        .mockResolvedValueOnce(arrRole)

      jest
        .spyOn(accountService['authService'], 'canAccountManageRoles')
        .mockResolvedValueOnce(true as never)

      jest
        .spyOn(accountService, 'createAccount')
        .mockResolvedValueOnce(createAccountServiceInput)

      await expect(
        accountService.createOrgMemberAccount(
          createAccountServiceInput.orgId,
          createAccountServiceInput,
        ),
      ).resolves.toMatchObject({
        email: 'nguyenvanhai141911@gmail.com',
        password: '12345678',
        username: 'nguyenvanhai',
        roles: ['owner', 'admin'],
        displayName: 'Nguyen Van Hai',
      })
    })

    it(`throws error if a staff creates staff or admin`, async () => {
      expect.assertions(1)

      const creatorTest: ANY = {
        orgId: objectId(),
        email: 'nguyenvanhai141911@gmail.com',
        password: '12345678',
        username: 'nguyenvanhai',
        roles: ['staff'],
        displayName: 'Nguyen Van Hai',
      }

      const arrRoleTest: Role[] = [
        {
          name: 'admin',
          priority: 2,
          permissions: [],
        },
        {
          name: 'owner',
          priority: 1,
          permissions: [],
        },
        {
          name: 'staff',
          priority: 3,
          permissions: [],
        },
        {
          name: 'lecturer',
          priority: 4,
          permissions: [],
        },
        {
          name: 'student',
          priority: 5,
          permissions: [],
        },
      ]

      const input: CreateAccountServiceInput = {
        orgId: objectId(),
        email: 'dustin.do95@gmail.com',
        password: '12345678',
        username: 'duongdev',
        roles: ['staff', 'admin'],
        displayName: 'Dustin Do',
      }

      jest
        .spyOn(accountService['authService'], 'mapOrgRolesFromNames')
        .mockResolvedValueOnce(arrRoleTest)

      jest
        .spyOn(accountService['authService'], 'canAccountManageRoles')
        .mockResolvedValueOnce(false as never)

      jest
        .spyOn(accountService, 'createAccount')
        .mockResolvedValueOnce(creatorTest)

      await expect(
        accountService.createOrgMemberAccount(creatorTest.id, input),
      ).rejects.toThrow('TARGET_ROLES_FORBIDDEN')
    })

    it(`allows staff to create lecturer or student`, async () => {
      expect.assertions(1)

      const creatorAccountInput: ANY = {
        orgId: objectId(),
        email: 'vanhai911@gmail.com',
        password: '12345678',
        username: 'haidev',
        roles: ['staff'],
        displayName: 'Hai Nguyen',
      }

      jest
        .spyOn(accountService['orgService'], 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      const creatorAccount = await accountService.createAccount(
        creatorAccountInput,
      )

      const accountInput: ANY = {
        orgId: creatorAccount.orgId,
        email: 'dustin.3123do95@gmail.com',
        password: '12345678',
        username: 'duo213gdev',
        roles: ['student', 'lecturer'],
        displayName: 'Dustin Do',
      }

      const arrRoleTest: Role[] = [
        {
          name: 'admin',
          priority: 2,
          permissions: [],
        },
        {
          name: 'owner',
          priority: 1,
          permissions: [],
        },
        {
          name: 'staff',
          priority: 3,
          permissions: [],
        },
        {
          name: 'lecturer',
          priority: 4,
          permissions: [],
        },
        {
          name: 'student',
          priority: 5,
          permissions: [],
        },
      ]

      jest
        .spyOn(accountService['authService'], 'mapOrgRolesFromNames')
        .mockResolvedValueOnce(arrRoleTest)

      jest
        .spyOn(accountService['authService'], 'getAccountRoles')
        .mockResolvedValue(creatorAccountInput.roles)

      jest
        .spyOn(accountService['authService'], 'canAccountManageRoles')
        .mockResolvedValueOnce(true as never)

      jest
        .spyOn(accountService, 'createAccount')
        .mockResolvedValueOnce(accountInput)

      await expect(
        accountService.createOrgMemberAccount(creatorAccount.id, accountInput),
      ).resolves.toMatchObject({
        email: 'dustin.3123do95@gmail.com',
        password: '12345678',
        username: 'duo213gdev',
        roles: ['student', 'lecturer'],
        displayName: 'Dustin Do',
      })
    })

    it(`allows admin to create staff or admin`, async () => {
      expect.assertions(1)

      const creatorAccountInput: ANY = {
        orgId: objectId(),
        email: 'vanhai911@gmail.com',
        password: '12345678',
        username: 'haidev',
        roles: ['admin'],
        displayName: 'Hai Nguyen',
      }

      jest
        .spyOn(accountService['orgService'], 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      const creatorAccount = await accountService.createAccount(
        creatorAccountInput,
      )

      const accountInput: ANY = {
        orgId: creatorAccount.orgId,
        email: 'dustin.3123do95@gmail.com',
        password: '12345678',
        username: 'duo213gdev',
        roles: ['admin', 'staff'],
        displayName: 'Dustin Do',
      }

      const arrRoleTest: Role[] = [
        {
          name: 'admin',
          priority: 2,
          permissions: [],
        },
        {
          name: 'owner',
          priority: 1,
          permissions: [],
        },
        {
          name: 'staff',
          priority: 3,
          permissions: [],
        },
        {
          name: 'lecturer',
          priority: 4,
          permissions: [],
        },
        {
          name: 'student',
          priority: 5,
          permissions: [],
        },
      ]

      jest
        .spyOn(accountService['authService'], 'mapOrgRolesFromNames')
        .mockResolvedValueOnce(arrRoleTest)

      jest
        .spyOn(accountService['authService'], 'getAccountRoles')
        .mockResolvedValue(creatorAccountInput.roles)

      jest
        .spyOn(accountService['authService'], 'canAccountManageRoles')
        .mockResolvedValueOnce(true as never)

      jest
        .spyOn(accountService, 'createAccount')
        .mockResolvedValueOnce(accountInput)

      await expect(
        accountService.createOrgMemberAccount(creatorAccount.id, accountInput),
      ).resolves.toMatchObject({
        email: 'dustin.3123do95@gmail.com',
        password: '12345678',
        username: 'duo213gdev',
        roles: ['admin', 'staff'],
        displayName: 'Dustin Do',
      })
    })
  })
})
