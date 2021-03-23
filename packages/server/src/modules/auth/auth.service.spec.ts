import { TestingModule } from '@nestjs/testing'
import * as bcrypt from 'bcrypt'
import { Connection } from 'mongoose'

import { objectId } from 'core/utils/db'
import { createTestingModule, initTestDb } from 'core/utils/testing'
import { ANY } from 'types'

import { AuthService } from './auth.service'
import { admin, lecturer, owner, staff, student } from './orgRolesMap'

describe('auth.service', () => {
  let module: TestingModule
  let authService: AuthService
  let mongooseConnection: Connection

  beforeAll(async () => {
    const testDb = await initTestDb()
    mongooseConnection = testDb.mongooseConnection

    module = await createTestingModule(testDb.uri)

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

  describe('getAccountPermissions', () => {
    it(`returns [] if accountId doesn't exist`, async () => {
      expect.assertions(1)
      await expect(
        authService.getAccountPermissions(objectId()),
      ).resolves.toStrictEqual([])
    })

    it(`returns permissions array correctly`, async () => {
      expect.assertions(1)
      const account = {
        id: objectId(),
        displayName: 'Dustin Do',
        email: 'dustin.do95@gmail.com',
        username: 'duongdev',
        roles: ['owner', 'staff'],
      }

      jest
        .spyOn(authService['accountService'], 'findAccountById')
        .mockResolvedValueOnce(account as ANY)

      await expect(
        authService.getAccountPermissions(account.id),
      ).resolves.toStrictEqual([
        'Hr_Access',
        'Hr_CreateOrgAccount',
        'Hr_ListOrgAccounts',
      ])
    })
  })

  describe('canAccountManageRoles', () => {
    it(`runs as my expected results`, async () => {
      expect.assertions(12)
      const accountId = objectId()

      // #region  Admin
      jest
        .spyOn(authService, 'getAccountRoles')
        .mockResolvedValue([admin, staff])

      // Can't manage other admin
      await expect(
        authService.canAccountManageRoles(accountId, [admin]),
      ).resolves.toBe(false)

      // Can't manage owner
      await expect(
        authService.canAccountManageRoles(accountId, [owner, staff]),
      ).resolves.toBe(false)

      // Can manage lower roles
      await expect(
        authService.canAccountManageRoles(accountId, [student, staff]),
      ).resolves.toBe(true)
      await expect(
        authService.canAccountManageRoles(accountId, [
          student,
          lecturer,
          staff,
        ]),
      ).resolves.toBe(true)
      // #endregion

      // #region Staff
      jest
        .spyOn(authService, 'getAccountRoles')
        .mockResolvedValue([student, staff])

      // can't manage owner, admin & staff
      await expect(
        authService.canAccountManageRoles(accountId, [owner]),
      ).resolves.toBe(false)
      await expect(
        authService.canAccountManageRoles(accountId, [admin]),
      ).resolves.toBe(false)
      await expect(
        authService.canAccountManageRoles(accountId, [owner, admin]),
      ).resolves.toBe(false)
      await expect(
        authService.canAccountManageRoles(accountId, [student, admin]),
      ).resolves.toBe(false)
      await expect(
        authService.canAccountManageRoles(accountId, [student, staff]),
      ).resolves.toBe(false)
      // can manage student & lecturer
      await expect(
        authService.canAccountManageRoles(accountId, [student]),
      ).resolves.toBe(true)
      await expect(
        authService.canAccountManageRoles(accountId, [lecturer]),
      ).resolves.toBe(true)
      await expect(
        authService.canAccountManageRoles(accountId, [student, lecturer]),
      ).resolves.toBe(true)
    })
  })

  describe('signIn', () => {
    it(`returns an error if 'orgNamespace' does not exist`, async () => {
      expect.assertions(1)

      await expect(
        authService.signIn({
          usernameOrEmail: '',
          password: '',
          orgNamespace: 'kmin-edu',
        }),
      ).rejects.toThrow(`Organization namespace kmin-edu doesn't exist`)
    })

    it(`returns an error if Account is not found`, async () => {
      expect.assertions(1)

      const org = {
        namespace: 'kmin-edu',
        name: 'Kmin Academy',
      }

      jest
        .spyOn(authService['orgService'], 'findOrgByNamespace')
        .mockResolvedValue(org as ANY)
      jest
        .spyOn(authService['accountService'], 'findAccountByUsernameOrEmail')
        .mockResolvedValue(null)

      await expect(
        authService.signIn({
          usernameOrEmail: 'duongdev',
          password: '12345',
          orgNamespace: 'kmin-edu',
        }),
      ).rejects.toThrow('INVALID_CREDENTIALS')
    })

    it('returns an error if password is false or not supplied', async () => {
      expect.assertions(2)

      const org = {
        namespace: 'kmin-edu',
        name: 'Kmin Academy',
      }

      const account = {
        id: objectId(),
        displayName: 'Dustin Do',
        email: 'dustin.do95@gmail.com',
        username: 'duongdev',
        roles: ['owner', 'staff'],
        password: bcrypt.hashSync('12345', 10),
      }

      jest
        .spyOn(authService['orgService'], 'findOrgByNamespace')
        .mockResolvedValue(org as ANY)
      jest
        .spyOn(authService['accountService'], 'findAccountByUsernameOrEmail')
        .mockResolvedValue(account as ANY)

      await expect(
        authService.signIn({
          usernameOrEmail: 'duongdev',
          password: '123456',
          orgNamespace: 'kmin-edu',
        }),
      ).rejects.toThrow('INVALID_CREDENTIALS')

      await expect(
        authService.signIn({
          usernameOrEmail: 'duongdev',
          password: '',
          orgNamespace: 'kmin-edu',
        }),
      ).rejects.toThrow('INVALID_CREDENTIALS')
    })

    it(`returns an object{ token, account, org, permissions }
    if all cases are passed`, async () => {
      expect.assertions(1)

      // Password
      const org = {
        namespace: 'kmin-edu',
        name: 'Kmin Academy',
      }

      const account = {
        id: objectId(),
        displayName: 'Dustin Do',
        email: 'dustin.do95@gmail.com',
        username: 'duongdev',
        roles: ['owner', 'staff'],
        password: bcrypt.hashSync('12345', 10),
      }

      jest
        .spyOn(authService['orgService'], 'findOrgByNamespace')
        .mockResolvedValue(org as ANY)
      jest
        .spyOn(authService['accountService'], 'findAccountByUsernameOrEmail')
        .mockResolvedValue(account as ANY)

      await expect(
        authService.signIn({
          usernameOrEmail: 'duongdev',
          password: '12345',
          orgNamespace: 'kmin-edu',
        }),
      ).resolves.toMatchObject({
        account: {
          id: account.id,
          email: 'dustin.do95@gmail.com',
          username: 'duongdev',
        },
        org: {
          name: 'Kmin Academy',
          namespace: 'kmin-edu',
        },
      })
    })
  })
})
