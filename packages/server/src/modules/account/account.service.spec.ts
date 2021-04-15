import { TestingModule } from '@nestjs/testing'
import { compareSync } from 'bcrypt'
import { Connection } from 'mongoose'

import { objectId } from 'core/utils/db'
import { createTestingModule, initTestDb } from 'core/utils/testing'
import { Role } from 'modules/auth/models'
import { ANY } from 'types'

import { AuthService } from '../auth/auth.service'
import { OrgService } from '../org/org.service'

import { AccountService } from './account.service'
import { CreateAccountServiceInput } from './account.type'
import { AccountStatus } from './models/Account'

describe('account.service', () => {
  let module: TestingModule
  let accountService: AccountService
  let orgService: OrgService
  let authService: AuthService
  let mongooseConnection: Connection

  beforeAll(async () => {
    const testDb = await initTestDb()
    mongooseConnection = testDb.mongooseConnection

    module = await createTestingModule(testDb.uri)

    accountService = module.get<AccountService>(AccountService)
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

    it(`replaces duplicated spaces in displayName by single spaces`, async () => {
      expect.assertions(1)

      const accountInput: CreateAccountServiceInput = {
        ...createAccountServiceInput,
        displayName: '    Dang    Hieu   Liem    ',
      }

      jest
        .spyOn(accountService['orgService'], 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      await expect(
        accountService.createAccount(accountInput),
      ).resolves.toMatchObject({
        displayName: 'Dang Hieu Liem',
      })
    })

    it(`throws error if displayName contains invalid characters`, async () => {
      expect.assertions(1)

      const accountInput: CreateAccountServiceInput = {
        ...createAccountServiceInput,
        displayName: '   */-++*++/*   ',
      }

      jest
        .spyOn(accountService['orgService'], 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      await expect(
        accountService.createAccount(accountInput),
      ).rejects.toThrowError('displayName contains invalid characters')
    })

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

  describe('findOneAccount', () => {
    it('returns an account if it exists', async () => {
      expect.assertions(4)

      const orgId1 = objectId()

      const orgId2 = objectId()

      const createAccountServiceInput: CreateAccountServiceInput = {
        orgId: orgId1,
        email: 'dustin.do95@gmail.com',
        password: '123456',
        username: 'duongdev',
        roles: ['owner', 'admin'],
        displayName: 'Dustin Do',
      }

      jest
        .spyOn(accountService['orgService'], 'validateOrgId')
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(true as never)

      const createdAccount = await accountService.createAccount(
        createAccountServiceInput,
      )
      const createdAccount2 = await accountService.createAccount({
        ...createAccountServiceInput,
        email: 'dustin2.do95@gmail.com',
        username: 'duongdev2',
        displayName: 'Dustin Do a',
      })

      const createdAccountDifferenceOrg = await accountService.createAccount({
        ...createAccountServiceInput,
        orgId: orgId2,
      })

      const createdAccountDifferenceOrg2 = await accountService.createAccount({
        ...createAccountServiceInput,
        email: 'dustin2.do95@gmail.com',
        username: 'duongdev2',
        displayName: 'Dustin Do a',
        orgId: orgId2,
      })

      await expect(
        accountService.findOneAccount({
          id: createdAccount.id,
          orgId: orgId1,
        }),
      ).resolves.toMatchObject({
        email: 'dustin.do95@gmail.com',
        username: 'duongdev',
        displayName: 'Dustin Do',
      })

      await expect(
        accountService.findOneAccount({
          id: createdAccount2.id,
          orgId: orgId1,
        }),
      ).resolves.toMatchObject({
        email: 'dustin2.do95@gmail.com',
        username: 'duongdev2',
        displayName: 'Dustin Do a',
      })

      await expect(
        accountService.findOneAccount({
          id: createdAccountDifferenceOrg.id,
          orgId: orgId2,
        }),
      ).resolves.toMatchObject({
        email: 'dustin.do95@gmail.com',
        username: 'duongdev',
        displayName: 'Dustin Do',
      })

      await expect(
        accountService.findOneAccount({
          id: createdAccountDifferenceOrg2.id,
          orgId: orgId2,
        }),
      ).resolves.toMatchObject({
        email: 'dustin2.do95@gmail.com',
        username: 'duongdev2',
        displayName: 'Dustin Do a',
      })
    })

    it('returns null if account does not exists', async () => {
      expect.assertions(3)

      const createAccountServiceInput: CreateAccountServiceInput = {
        orgId: objectId(),
        email: 'dustin.do95@gmail.com',
        password: '123456',
        username: 'duongdev',
        roles: ['owner', 'admin'],
        displayName: 'Dustin Do',
      }

      jest
        .spyOn(accountService['orgService'], 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      const createdAccount = await accountService.createAccount(
        createAccountServiceInput,
      )

      await expect(
        accountService.findOneAccount({
          id: objectId(),
          orgId: createdAccount.orgId,
        }),
      ).resolves.toBeNull()

      await expect(
        accountService.findOneAccount({
          id: createdAccount.id,
          orgId: objectId(),
        }),
      ).resolves.toBeNull()

      await expect(
        accountService.findOneAccount({
          id: objectId(),
          orgId: objectId(),
        }),
      ).resolves.toBeNull()
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
          displayName: 'Yami Dokia',
        }),
      )

      listCreatedAccountOrgId1.push(
        await accountService.createAccount({
          ...createAccountServiceInput,
          email: 'hieuliem332@gmail.com',
          username: 'hieuliem2',
          displayName: 'Yami Dokib',
        }),
      )

      listCreatedAccountOrgId1.push(
        await accountService.createAccount({
          ...createAccountServiceInput,
          email: 'hieuliem333@gmail.com',
          username: 'hieuliem3',
          displayName: 'Yami Dokic',
        }),
      )

      listCreatedAccountOrgId1.push(
        await accountService.createAccount({
          ...createAccountServiceInput,
          email: 'hieuliem334@gmail.com',
          username: 'hieuliem4',
          displayName: 'Yami Dokid',
        }),
      )

      listCreatedAccountOrgId1.push(
        await accountService.createAccount({
          ...createAccountServiceInput,
          email: 'hieuliem335@gmail.com',
          username: 'hieuliem5',
          displayName: 'Yami Dokie',
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
          displayName: 'Yami Dokia',
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
            displayName: 'Yami Dokic',
          },
          {
            email: 'hieuliem332@gmail.com',
            username: 'hieuliem2',
            displayName: 'Yami Dokib',
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
            displayName: 'Yami Dokic',
          },
          {
            email: 'hieuliem332@gmail.com',
            username: 'hieuliem2',
            displayName: 'Yami Dokib',
          },
          {
            email: 'hieuliem331@gmail.com',
            username: 'hieuliem1',
            displayName: 'Yami Dokia',
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
            displayName: 'Yami Dokie',
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
            displayName: 'Yami Dokia',
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
            displayName: 'Yami Dokia',
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

  describe('updateOrgMemberAccount', () => {
    it(`returns the account if updaterId equal query id and account does not have permission to update`, async () => {
      expect.assertions(1)

      jest
        .spyOn(accountService['orgService'], 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      const org = await orgService.createOrg({
        namespace: 'kmin-edu',
        name: 'Kmin Academy',
      })

      const account = await accountService.createAccount({
        username: 'duongdev',
        email: 'dustin.do95@gmail.com',
        password: 'rawPass',
        orgId: org.id,
        roles: ['admin'],
        displayName: 'Dustin Do',
      })

      jest
        .spyOn(accountService['authService'], 'accountHasPermission')
        .mockResolvedValueOnce(false as never)

      await expect(
        accountService.updateOrgMemberAccount(
          account.id,
          {
            id: account.id,
            orgId: account.orgId,
          },
          {
            displayName: 'Thanh Canh',
            password: '12345',
            roles: ['owner', 'admin', 'admin'],
          },
        ),
      ).resolves.toMatchObject({
        displayName: 'Thanh Canh',
      })
    })

    it('throws error if account does not have permission to update', async () => {
      expect.assertions(1)

      jest
        .spyOn(accountService['authService'], 'accountHasPermission')
        .mockResolvedValueOnce(false as never)

      await expect(
        accountService.updateOrgMemberAccount(
          objectId(),
          {
            id: objectId(),
            orgId: objectId(),
          },
          {
            displayName: 'Thanh Canh',
            password: '12345',
          },
        ),
      ).rejects.toThrow()
    })

    it('throws error if account not is a target account', async () => {
      expect.assertions(1)

      jest
        .spyOn(accountService['authService'], 'accountHasPermission')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(accountService['accountModel'], 'findOne')
        .mockResolvedValueOnce(null)

      await expect(
        accountService.updateOrgMemberAccount(
          objectId(),
          {
            id: objectId(),
            orgId: objectId(),
          },
          {
            displayName: 'Thanh Canh',
            password: '12345',
          },
        ),
      ).rejects.toThrow(`Couldn't find account to update`)
    })

    it('throws error if target account is not a manager account', async () => {
      expect.assertions(1)

      jest
        .spyOn(accountService['authService'], 'accountHasPermission')
        .mockResolvedValueOnce(true as never)

      const account: ANY = {
        username: 'duongdev',
        email: 'dustin.do95@gmail.com',
        password: 'rawPass',
        orgId: objectId(),
        roles: ['admin'],
        displayName: 'Dustin Do',
      }

      jest
        .spyOn(accountService['accountModel'], 'findOne')
        .mockResolvedValueOnce(account)
      jest
        .spyOn(accountService['authService'], 'canAccountManageRoles')
        .mockResolvedValueOnce(false as never)

      await expect(
        accountService.updateOrgMemberAccount(
          objectId(),
          {
            id: objectId(),
            orgId: objectId(),
          },
          {
            displayName: 'Thanh Canh',
            password: '12345',
          },
        ),
      ).rejects.toThrow()
    })

    it('throws error if roles is not empty and account is a manager account', async () => {
      expect.assertions(1)

      jest
        .spyOn(accountService['authService'], 'accountHasPermission')
        .mockResolvedValueOnce(true as never)

      const account: ANY = {
        username: 'duongdev',
        email: 'dustin.do95@gmail.com',
        password: 'rawPass',
        orgId: objectId(),
        roles: ['admin'],
        displayName: 'Dustin Do',
      }

      jest
        .spyOn(accountService['accountModel'], 'findOne')
        .mockResolvedValueOnce(account)
      jest
        .spyOn(accountService['authService'], 'canAccountManageRoles')
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(true as never)

      await expect(
        accountService.updateOrgMemberAccount(
          objectId(),
          {
            id: objectId(),
            orgId: objectId(),
          },
          {
            displayName: 'Thanh Canh',
            password: '12345',
            roles: ['owner', 'admin', 'admin'],
          },
        ),
      ).rejects.toThrow()
    })

    it('returns the account with new info if the input is valid', async () => {
      expect.assertions(1)

      jest
        .spyOn(accountService['authService'], 'accountHasPermission')
        .mockResolvedValueOnce(true as never)

      const org = await orgService.createOrg({
        namespace: 'kmin-edu',
        name: 'Kmin Academy',
      })

      const account = await accountService.createAccount({
        username: 'duongdev',
        email: 'dustin.do95@gmail.com',
        password: 'rawPass',
        orgId: org.id,
        roles: ['admin'],
        displayName: 'Dustin Do',
      })

      jest
        .spyOn(accountService['authService'], 'accountHasPermission')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(accountService['accountModel'], 'findOne')
        .mockResolvedValueOnce(account)
      jest
        .spyOn(accountService['authService'], 'canAccountManageRoles')
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(false as never)

      await expect(
        accountService.updateOrgMemberAccount(
          account.id,
          {
            id: account.id,
            orgId: account.orgId,
          },
          {
            displayName: 'Thanh Canh',
          },
        ),
      ).resolves.toMatchObject({
        displayName: 'Thanh Canh',
        username: 'duongdev',
        email: 'dustin.do95@gmail.com',
      })
    })
  })

  describe('createOrgMemberAccount', () => {
    const createAccountServiceInput: ANY = {
      orgId: objectId(),
      email: 'nguyenvanhai141911@gmail.com',
      password: '1234567',
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

    it(`returns the account if a member is created`, async () => {
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
        password: '1234567',
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
        password: '1234567',
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
        password: '1234567',
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
        password: '1234567',
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
        password: '1234567',
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
        password: '1234567',
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
        password: '1234567',
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
        password: '1234567',
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
        password: '1234567',
        username: 'duo213gdev',
        roles: ['admin', 'staff'],
        displayName: 'Dustin Do',
      })
    })
  })

  describe('updateAccount', () => {
    it(`throws error if couldn't find account to update`, async () => {
      expect.assertions(1)

      jest
        .spyOn(accountService['accountModel'], 'findOne')
        .mockResolvedValueOnce(null)

      await expect(
        accountService.updateAccount(
          {
            id: objectId(),
            orgId: objectId(),
          },
          {
            displayName: 'van hai',
            email: 'vanhai0911@gmail.com',
            username: 'haidev',
          },
        ),
      ).rejects.toThrow(`Couldn't find account to update`)
    })

    it(`returns an account with a new displayname`, async () => {
      expect.assertions(1)

      const org = await orgService.createOrg({
        namespace: 'kmin-edu',
        name: 'Kmin Academy',
      })

      const account = await accountService.createAccount({
        username: 'duongdev',
        email: 'dustin.do95@gmail.com',
        password: 'rawPass',
        orgId: org.id,
        roles: ['admin'],
        displayName: 'Dustin Do',
      })

      jest
        .spyOn(accountService['accountModel'], 'findOne')
        .mockResolvedValueOnce(account)

      await expect(
        accountService.updateAccount(
          {
            id: account.id,
            orgId: account.orgId,
          },
          {
            displayName: 'nguyen van hai',
          },
        ),
      ).resolves.toMatchObject({
        username: 'duongdev',
        email: 'dustin.do95@gmail.com',
        displayName: 'nguyen van hai',
      })
    })

    it(`returns an account with a new email`, async () => {
      expect.assertions(1)

      const org = await orgService.createOrg({
        namespace: 'kmin-edu',
        name: 'Kmin Academy',
      })

      const account = await accountService.createAccount({
        username: 'duongdev',
        email: 'dustin.do95@gmail.com',
        password: 'rawPass',
        orgId: org.id,
        roles: ['admin'],
        displayName: 'Dustin Do',
      })

      jest
        .spyOn(accountService['accountModel'], 'findOne')
        .mockResolvedValueOnce(account)

      await expect(
        accountService.updateAccount(
          {
            id: account.id,
            orgId: account.orgId,
          },
          {
            email: 'vanhai0911@gmail.com',
          },
        ),
      ).resolves.toMatchObject({
        username: 'duongdev',
        email: 'vanhai0911@gmail.com',
        displayName: 'Dustin Do',
      })
    })

    it(`returns an account with a new username`, async () => {
      expect.assertions(1)

      const org = await orgService.createOrg({
        namespace: 'kmin-edu',
        name: 'Kmin Academy',
      })

      const account = await accountService.createAccount({
        username: 'duongdev',
        email: 'dustin.do95@gmail.com',
        password: 'rawPass',
        orgId: org.id,
        roles: ['admin'],
        displayName: 'Dustin Do',
      })

      jest
        .spyOn(accountService['accountModel'], 'findOne')
        .mockResolvedValueOnce(account)

      await expect(
        accountService.updateAccount(
          {
            id: account.id,
            orgId: account.orgId,
          },
          {
            username: 'haidev',
          },
        ),
      ).resolves.toMatchObject({
        username: 'haidev',
        email: 'dustin.do95@gmail.com',
        displayName: 'Dustin Do',
      })
    })

    it(`returns an account with a new password`, async () => {
      expect.assertions(1)

      const org = await orgService.createOrg({
        namespace: 'kmin-edu',
        name: 'Kmin Academy',
      })

      const account = await accountService.createAccount({
        username: 'duongdev',
        email: 'dustin.do95@gmail.com',
        password: '1234567',
        orgId: org.id,
        roles: ['admin'],
        displayName: 'Dustin Do',
      })

      jest
        .spyOn(accountService['accountModel'], 'findOne')
        .mockResolvedValueOnce(account)

      const accountUpdated = await accountService.updateAccount(
        {
          id: account.id,
          orgId: account.orgId,
        },
        {
          password: '123456',
        },
      )

      await expect(compareSync('123456', accountUpdated.password)).toBeTruthy()
    })
  })

  describe('updateOrgMemberAccountStatus', () => {
    it(`throws an error if the update object is itself`, async () => {
      expect.assertions(1)

      const updaterId = objectId()

      await expect(
        accountService.updateOrgMemberAccountStatus(
          updaterId,
          {
            id: updaterId,
            orgId: objectId(),
          },
          AccountStatus.Active,
        ),
      ).rejects.toThrowError(
        `Can't change activate/deactivate status by yourself`,
      )
    })

    it(`throws an error if account hasn't permission`, async () => {
      expect.assertions(1)

      const updaterId = objectId()

      await expect(
        accountService.updateOrgMemberAccountStatus(
          updaterId,
          {
            id: objectId(),
            orgId: objectId(),
          },
          AccountStatus.Active,
        ),
      ).rejects.toThrowError(
        `Access denied! You don't have permission for this action!`,
      )
    })

    it(`throws an error if the account isn't found`, async () => {
      expect.assertions(1)

      const updaterId = objectId()

      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)

      await expect(
        accountService.updateOrgMemberAccountStatus(
          updaterId,
          {
            id: objectId(),
            orgId: objectId(),
          },
          AccountStatus.Active,
        ),
      ).rejects.toThrowError(`Couldn't find account to update`)
    })

    it('throws error if target account is not a manager account', async () => {
      expect.assertions(1)

      jest
        .spyOn(accountService['authService'], 'accountHasPermission')
        .mockResolvedValueOnce(true as never)

      const account: ANY = {
        username: 'thanhcanh',
        email: 'thanhcanh@gmail.com',
        password: '12345',
        orgId: objectId(),
        roles: ['admin'],
        displayName: 'Thanh Canh',
      }

      jest
        .spyOn(accountService['accountModel'], 'findOne')
        .mockResolvedValueOnce(account)
      jest
        .spyOn(accountService['authService'], 'canAccountManageRoles')
        .mockResolvedValueOnce(false as never)

      await expect(
        accountService.updateOrgMemberAccountStatus(
          objectId(),
          {
            id: objectId(),
            orgId: objectId(),
          },
          AccountStatus.Active,
        ),
      ).rejects.toThrowError(
        `Access denied! You don't have permission for this action!`,
      )
    })

    it(`throws an error if the permission input is invalid`, async () => {
      expect.assertions(1)

      jest
        .spyOn(accountService['authService'], 'accountHasPermission')
        .mockResolvedValueOnce(true as never)

      const org = await orgService.createOrg({
        namespace: 'kmin-edu',
        name: 'Kmin Academy',
      })

      const account1: CreateAccountServiceInput = {
        email: 'dustin.do95@gmail.com',
        password: '123456',
        username: 'duongdev',
        roles: ['admin'],
        orgId: org.id,
        displayName: 'Dustin Do',
      }

      const account2: ANY = {
        email: 'thanhcanh@gmail.com',
        password: '12345',
        username: 'thanhcanh',
        roles: ['student'],
        orgId: org.id,
        displayName: 'Thanh Canh',
      }

      const accountUpdater = await accountService.createAccount(account1)
      const targetAccount = await accountService.createAccount(account2)

      jest
        .spyOn(accountService['accountModel'], 'findOne')
        .mockResolvedValueOnce(targetAccount)

      const permission: ANY = 'taolao'

      await expect(
        accountService.updateOrgMemberAccountStatus(
          accountUpdater.id,
          {
            id: targetAccount.id,
            orgId: org.id,
          },
          permission,
        ),
      ).rejects.toThrowError(
        'Account validation failed: status: `taolao` is not a valid enum value for path `status`.',
      )
    })

    it(`returns an account if the input is valid and the target account is the lecturer or student`, async () => {
      expect.assertions(1)

      jest
        .spyOn(accountService['authService'], 'accountHasPermission')
        .mockResolvedValueOnce(true as never)

      const org = await orgService.createOrg({
        namespace: 'kmin-edu',
        name: 'Kmin Academy',
      })

      const account1: CreateAccountServiceInput = {
        email: 'dustin.do95@gmail.com',
        password: '123456',
        username: 'duongdev',
        roles: ['admin'],
        orgId: org.id,
        displayName: 'Dustin Do',
      }

      const account2: ANY = {
        email: 'thanhcanh@gmail.com',
        password: '12345',
        username: 'thanhcanh',
        roles: ['student'],
        orgId: org.id,
        displayName: 'Thanh Canh',
      }

      const accountUpdater = await accountService.createAccount(account1)
      const targetAccount = await accountService.createAccount(account2)

      jest
        .spyOn(accountService['accountModel'], 'findOne')
        .mockResolvedValueOnce(targetAccount)

      await expect(
        accountService.updateOrgMemberAccountStatus(
          accountUpdater.id,
          {
            id: targetAccount.id,
            orgId: org.id,
          },
          AccountStatus.Deactivated,
        ),
      ).resolves.toMatchObject({
        displayName: 'Thanh Canh',
        status: 'Deactivated',
      })
    })
  })
})
