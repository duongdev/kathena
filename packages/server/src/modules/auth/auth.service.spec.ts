import { TestingModule } from '@nestjs/testing'
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

      await expect(authService.getAccountPermissions(account.id)).resolves
        .toMatchInlineSnapshot(`
              Array [
                "Hr_Access",
                "Hr_CreateOrgAccount",
                "Hr_ListOrgAccounts",
                "Academic_CreateAcademicSubject",
              ]
            `)
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
})
