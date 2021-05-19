import { TestingModule } from '@nestjs/testing'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { Connection } from 'mongoose'

import { objectId } from 'core/utils/db'
import { createTestingModule, initTestDb } from 'core/utils/testing'
import { AcademicService } from 'modules/academic/academic.service'
import { OrgService } from 'modules/org/org.service'
import { ANY } from 'types'

import { AuthService } from './auth.service'
import { Role } from './models'
import { admin, lecturer, owner, staff, student } from './orgRolesMap'

describe('auth.service', () => {
  let module: TestingModule
  let authService: AuthService
  let mongooseConnection: Connection
  let academicService: AcademicService
  let orgService: OrgService

  beforeAll(async () => {
    const testDb = await initTestDb()
    mongooseConnection = testDb.mongooseConnection

    module = await createTestingModule(testDb.uri)

    authService = module.get<AuthService>(AuthService)

    academicService = module.get<AcademicService>(AcademicService)

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

  describe('accountHasPermission', () => {
    it('returns true if account has permission', async () => {
      expect.assertions(15)

      const resultPermissions: ANY = [
        'Hr_Access',
        'Hr_CreateOrgAccount',
        'Hr_ListOrgAccounts',
        'Hr_UpdateOrgAccountStatus',
        'Academic_CreateAcademicSubject',
        'Academic_ListAcademicSubjects',
        'Academic_SetAcademicSubjectPublication',
        'Academic_UpdateAcademicSubject',
        'Academic_ListCourses',
        'Academic_UpdateCourse',
        'Academic_CreateCourse',
        'Academic_AddStudentsToCourse',
        'Academic_AddLecturersToCourse',
        'Academic_RemoveStudentsFromCourse',
        'Academic_RemoveLecturersFromCourse',
        'Academic_AcademicSubject_Access',
        'Academic_Course_Access',
        'Classwork_ListClassworkAssignment',
        'Classwork_CreateClassworkAssignment',
        'OrgOffice_Access',
        'OrgOffice_ListOrgOffices',
        'OrgOffice_CreateOrgOffice',
        'OrgOffice_UpdateOrgOffice',
        'Classwork_ListClassworkAssignment',
      ]

      jest
        .spyOn(authService, 'getAccountPermissions')
        .mockResolvedValueOnce(resultPermissions)
        .mockResolvedValueOnce(resultPermissions)
        .mockResolvedValueOnce(resultPermissions)
        .mockResolvedValueOnce(resultPermissions)
        .mockResolvedValueOnce(resultPermissions)
        .mockResolvedValueOnce(resultPermissions)
        .mockResolvedValueOnce(resultPermissions)
        .mockResolvedValueOnce(resultPermissions)
        .mockResolvedValueOnce(resultPermissions)
        .mockResolvedValueOnce(resultPermissions)
        .mockResolvedValueOnce(resultPermissions)
        .mockResolvedValueOnce(resultPermissions)
        .mockResolvedValueOnce(resultPermissions)
        .mockResolvedValueOnce(resultPermissions)
        .mockResolvedValueOnce(resultPermissions)

      await expect(
        authService.accountHasPermission({
          accountId: objectId().toString(),
          permission: 'Hr_Access',
        }),
      ).resolves.toBe(true)

      await expect(
        authService.accountHasPermission({
          accountId: objectId().toString(),
          permission: 'Hr_CreateOrgAccount',
        }),
      ).resolves.toBe(true)

      await expect(
        authService.accountHasPermission({
          accountId: objectId().toString(),
          permission: 'Hr_ListOrgAccounts',
        }),
      ).resolves.toBe(true)

      await expect(
        authService.accountHasPermission({
          accountId: objectId().toString(),
          permission: 'Academic_CreateAcademicSubject',
        }),
      ).resolves.toBe(true)

      await expect(
        authService.accountHasPermission({
          accountId: objectId().toString(),
          permission: 'Academic_ListAcademicSubjects',
        }),
      ).resolves.toBe(true)

      await expect(
        authService.accountHasPermission({
          accountId: objectId().toString(),
          permission: 'Academic_SetAcademicSubjectPublication',
        }),
      ).resolves.toBe(true)

      await expect(
        authService.accountHasPermission({
          accountId: objectId().toString(),
          permission: 'Academic_UpdateAcademicSubject',
        }),
      ).resolves.toBe(true)

      await expect(
        authService.accountHasPermission({
          accountId: objectId().toString(),
          permission: 'Academic_ListCourses',
        }),
      ).resolves.toBe(true)

      await expect(
        authService.accountHasPermission({
          accountId: objectId().toString(),
          permission: 'Academic_RemoveStudentsFromCourse',
        }),
      ).resolves.toBe(true)

      await expect(
        authService.accountHasPermission({
          accountId: objectId().toString(),
          permission: 'Academic_RemoveLecturersFromCourse',
        }),
      ).resolves.toBe(true)

      await expect(
        authService.accountHasPermission({
          accountId: objectId().toString(),
          permission: 'OrgOffice_UpdateOrgOffice',
        }),
      ).resolves.toBe(true)

      await expect(
        authService.accountHasPermission({
          accountId: objectId().toString(),
          permission: 'Academic_AcademicSubject_Access',
        }),
      ).resolves.toBe(true)

      await expect(
        authService.accountHasPermission({
          accountId: objectId().toString(),
          permission: 'Academic_Course_Access',
        }),
      ).resolves.toBe(true)

      await expect(
        authService.accountHasPermission({
          accountId: objectId().toString(),
          permission: 'OrgOffice_Access',
        }),
      ).resolves.toBe(true)

      await expect(
        authService.accountHasPermission({
          accountId: objectId().toString(),
          permission: 'Classwork_ListClassworkAssignment',
        }),
      ).resolves.toBe(true)
    })

    it(`returns false if account doesn't have permission`, async () => {
      expect.assertions(3)

      await expect(
        authService.accountHasPermission({
          accountId: objectId().toString(),
          permission: 'Academic_CreateAcademicSubject',
        }),
      ).resolves.toBe(false)

      await expect(
        authService.accountHasPermission({
          accountId: objectId().toString(),
          permission: 'awdawdawd',
        }),
      ).resolves.toBe(false)

      await expect(
        authService.accountHasPermission({
          accountId: objectId().toString(),
          permission: '     ',
        }),
      ).resolves.toBe(false)
    })
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
                "Hr_UpdateOrgAccountStatus",
                "Academic_CreateAcademicSubject",
                "Academic_ListAcademicSubjects",
                "Academic_SetAcademicSubjectPublication",
                "Academic_UpdateAcademicSubject",
                "Academic_ListCourses",
                "Academic_UpdateCourse",
                "Academic_CreateCourse",
                "Academic_AddStudentsToCourse",
                "Academic_AddLecturersToCourse",
                "Academic_RemoveStudentsFromCourse",
                "Academic_RemoveLecturersFromCourse",
                "OrgOffice_ListOrgOffices",
                "OrgOffice_CreateOrgOffice",
                "OrgOffice_UpdateOrgOffice",
                "Academic_AcademicSubject_Access",
                "Academic_Course_Access",
                "Classwork_ListClassworkAssignment",
                "Classwork_CreateClassworkAssignment",
                "OrgOffice_Access",
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

  describe('signAccountToken', () => {
    it(`throws error if accountId doesn't exist`, async () => {
      expect.assertions(1)

      const account: ANY = {
        orgId: objectId(),
      }

      await expect(authService.signAccountToken(account)).rejects.toThrow(
        'ACCOUNT_ID_NOT_FOUND',
      )
    })

    it(`throws error if orgId doesn't exist`, async () => {
      expect.assertions(1)
      const acc: ANY = {
        id: objectId(),
      }

      expect.assertions(1)
      await expect(authService.signAccountToken(acc)).rejects.toThrow(
        'ORG_ID_NOT_FOUND',
      )
    })

    it('returns a valid json web token', async () => {
      expect.assertions(1)

      const account = {
        id: objectId(),
        displayName: 'Dustin Do',
        email: 'dustin.do95@gmail.com',
        username: 'duongdev',
        roles: ['owner', 'staff'],
        orgId: objectId(),
      }

      expect.assertions(1)
      const result: ANY = jwt.decode(
        await authService.signAccountToken(account),
      )
      const obj = {
        id: result.accountId,
        orgId: result.orgId,
      }
      expect(obj).toMatchObject({
        id: account.id,
        orgId: account.orgId,
      })
    })
  })

  describe('signIn', () => {
    it(`throws an error if 'orgNamespace' does not exist`, async () => {
      expect.assertions(1)

      await expect(
        authService.signIn({
          usernameOrEmail: '',
          password: '',
          orgNamespace: 'kmin-edu',
        }),
      ).rejects.toThrow(`Organization namespace kmin-edu doesn't exist`)
    })

    it(`throws error 'INVALID_CREDENTIALS' if Account is not found`, async () => {
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

    it(`throws error 'INVALID_CREDENTIALS' if password is false or not supplied`, async () => {
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

    it(`returns an object { token, account, org, permissions } if all cases are passed`, async () => {
      expect.assertions(1)

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
        orgId: objectId(),
      }

      jest
        .spyOn(authService['orgService'], 'findOrgByNamespace')
        .mockResolvedValue(org as ANY)
      jest
        .spyOn(authService['accountService'], 'findAccountByUsernameOrEmail')
        .mockResolvedValue(account as ANY)
      jest
        .spyOn(authService['accountService'], 'findAccountById')
        .mockResolvedValue(account as ANY)

      const objSignIn = await authService.signIn({
        usernameOrEmail: 'duongdev',
        password: '12345',
        orgNamespace: 'kmin-edu',
      })

      const decodeToken: ANY = jwt.decode(objSignIn.token)

      const objResult = {
        ...objSignIn,
        token: {
          id: decodeToken.accountId,
          orgId: decodeToken.orgId,
        },
      }

      expect(objResult).toMatchObject({
        token: {
          id: account.id,
          orgId: account.orgId,
        },
        account: {
          displayName: 'Dustin Do',
          email: 'dustin.do95@gmail.com',
          username: 'duongdev',
          roles: ['owner', 'staff'],
          orgId: account.orgId,
        },
        org: {
          namespace: 'kmin-edu',
          name: 'Kmin Academy',
        },
      })
    })
  })

  describe('mapOrgRolesFromNames', () => {
    it('returns a map org roles from name', async () => {
      expect.assertions(5)
      const arrRoles: Role[] = [
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
      ]

      jest
        .spyOn(authService, 'getOrgRoles')
        .mockResolvedValueOnce(arrRoles)
        .mockResolvedValueOnce(arrRoles)
        .mockResolvedValueOnce(arrRoles)

      await expect(
        authService.mapOrgRolesFromNames({
          orgId: objectId(),
          roleNames: [...arrRoles.map((roles) => roles.name.toString())],
        }),
      ).resolves.toMatchObject([...arrRoles])

      await expect(
        authService.mapOrgRolesFromNames({
          orgId: objectId(),
          roleNames: [
            ...arrRoles.map((roles) => roles.name.toString()),
            'test1',
          ],
        }),
      ).resolves.toMatchObject([...arrRoles])

      await expect(
        authService.mapOrgRolesFromNames({
          orgId: objectId(),
          roleNames: ['owner'],
        }),
      ).resolves.toMatchObject([arrRoles[1]])

      await expect(
        authService.mapOrgRolesFromNames({
          orgId: objectId(),
          roleNames: ['test'],
        }),
      ).resolves.toMatchObject([])

      await expect(
        authService.mapOrgRolesFromNames({
          orgId: objectId(),
          roleNames: [],
        }),
      ).resolves.toMatchObject([])
    })
  })

  describe('getAccountRoles', () => {
    it(`returns [] if account doesn't exist`, async () => {
      expect.assertions(1)
      await expect(
        authService.getAccountRoles(objectId()),
      ).resolves.toStrictEqual([])
    })

    it(`returns Account Roles`, async () => {
      expect.assertions(1)

      const account: ANY = {
        id: objectId(),
        displayName: 'Nguyen Van Hai',
        email: 'nguyenvanhai141911@gmail.com',
        username: 'hainguyen',
        roles: ['owner', 'staff'],
        password: bcrypt.hashSync('12345', 10),
      }

      jest
        .spyOn(authService['accountService'], 'findAccountById')
        .mockResolvedValueOnce(account)

      await expect(
        authService.getAccountRoles(account.id),
      ).resolves.toMatchSnapshot()
    })
  })
  describe('canAccountManageCourse', () => {
    it('returns false if account is not found', async () => {
      expect.assertions(1)

      await expect(
        authService.canAccountManageCourse(objectId(), objectId()),
      ).resolves.toBeFalsy()
    })

    it('returns false if course is not found', async () => {
      expect.assertions(1)

      const account: ANY = {
        orgId: objectId(),
      }

      jest
        .spyOn(authService['accountService'], 'findAccountById')
        .mockResolvedValueOnce(account as ANY)

      await expect(
        authService.canAccountManageCourse(objectId(), account.orgId),
      ).resolves.toBeFalsy()
    })

    it('returns true if account can manage course', async () => {
      expect.assertions(3)

      const courseInpust: ANY = {
        academicSubjectId: objectId(),
        code: 'string',
        name: 'string',
        startDate: Date.now(),
        tuitionFee: 123123,
        lecturerIds: [],
      }

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(academicService, 'findAcademicSubjectById')
        .mockResolvedValueOnce(true as never)

      const course = await academicService.createCourse(
        objectId(),
        objectId(),
        courseInpust,
      )

      const courseEdited = {
        lecturerIds: [objectId(), objectId(), objectId()],
      }

      jest
        .spyOn(authService['accountService'], 'findAccountById')
        .mockResolvedValueOnce({ id: courseEdited.lecturerIds[0] } as ANY)
        .mockResolvedValueOnce({ id: courseEdited.lecturerIds[1] } as ANY)
        .mockResolvedValueOnce({ id: courseEdited.lecturerIds[2] } as ANY)

      jest
        .spyOn(authService['academicService'], 'findCourseById')
        .mockResolvedValueOnce(courseEdited as ANY)
        .mockResolvedValueOnce(courseEdited as ANY)
        .mockResolvedValueOnce(courseEdited as ANY)

      await expect(
        authService.canAccountManageCourse(
          courseEdited.lecturerIds[0],
          course.id,
        ),
      ).resolves.toBeTruthy()

      await expect(
        authService.canAccountManageCourse(
          courseEdited.lecturerIds[1],
          course.id,
        ),
      ).resolves.toBeTruthy()

      await expect(
        authService.canAccountManageCourse(
          courseEdited.lecturerIds[2],
          course.id,
        ),
      ).resolves.toBeTruthy()
    })

    it('returns false if account can manage course', async () => {
      expect.assertions(1)

      const account: ANY = {
        orgId: objectId(),
      }

      const academic: ANY = {
        lecturerIds: [account.orgId],
      }

      jest
        .spyOn(authService['accountService'], 'findAccountById')
        .mockResolvedValueOnce(account as ANY)

      jest
        .spyOn(authService['academicService'], 'findCourseById')
        .mockResolvedValueOnce(academic as ANY)

      await expect(
        authService.canAccountManageCourse(objectId(), objectId()),
      ).resolves.toBeFalsy()
    })
  })
})
