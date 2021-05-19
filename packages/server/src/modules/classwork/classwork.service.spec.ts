import { TestingModule } from '@nestjs/testing'
// import { compareSync } from 'bcrypt'
import { Connection } from 'mongoose'

// import { objectId } from 'core/utils/db'
import { objectId } from 'core'
// eslint-disable-next-line import/order
import { createTestingModule, initTestDb } from 'core/utils/testing'
// import { Role } from 'modules/auth/models'
// import { ANY } from 'types'

import { AcademicService } from 'modules/academic/academic.service'
import { AccountService } from 'modules/account/account.service'
import { AuthService } from 'modules/auth/auth.service'
import { OrgService } from 'modules/org/org.service'
import { ANY } from 'types'

import { ClassworkService } from './classwork.service'

describe('classwork.service', () => {
  let module: TestingModule
  let classworkService: ClassworkService
  let mongooseConnection: Connection
  let orgService: OrgService
  let authService: AuthService
  let accountService: AccountService
  let academicService: AcademicService

  beforeAll(async () => {
    const testDb = await initTestDb()
    mongooseConnection = testDb.mongooseConnection

    module = await createTestingModule(testDb.uri)

    classworkService = module.get<ClassworkService>(ClassworkService)
    academicService = module.get<AcademicService>(AcademicService)
    classworkService = module.get<ClassworkService>(ClassworkService)
    orgService = module.get<OrgService>(OrgService)
    authService = module.get<AuthService>(AuthService)
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
    expect(classworkService).toBeDefined()
  })

  /**
   * START CLASSWORK MATERIAL
   */

  // TODO: Delete this line and start the code here

  /**
   * END CLASSWORK MATERIAL
   */

  /**
   * START CLASSWORK ASSIGNMENTS
   */

  describe('createClassworkAssignment', () => {
    const classworkAssignmentInput: ANY = {
      createdByAccountId: objectId(),
      title: 'Bai tap so 1',
    }

    it(`throws error "Org ID is invalid" if org id is not valid`, async () => {
      expect.assertions(1)

      await expect(
        classworkService.createClassworkAssignment(
          objectId(),
          objectId(),
          objectId(),
          {
            ...classworkAssignmentInput,
            dueDate: '1618765200000',
          },
        ),
      ).rejects.toThrowError('Org ID is invalid')
    })

    it(`throws error "CAN_NOT_CREATE_CLASSWORK_ASSIGNMENT" if Account or Course is not found`, async () => {
      expect.assertions(2)

      const org = await orgService.createOrg({
        name: 'kmin',
        namespace: 'kmin-edu',
      })

      const creatorAccount = await accountService.createAccount({
        orgId: org.id,
        email: 'lecturer@gmail.com',
        password: '123456',
        username: 'lecturer',
        roles: ['lecturer'],
        displayName: 'Lecturer',
      })

      const createCourse: ANY = {
        academicSubjectId: objectId(),
        code: 'NodeJS-12',
        name: 'Node Js Thang 12',
        tuitionFee: 5000000,
        lecturerIds: creatorAccount.id,
      }

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(true as never)

      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(false as never)
        .mockResolvedValueOnce(false as never)

      await expect(
        classworkService.createClassworkAssignment(
          objectId(),
          createCourse.id,
          org.id,
          {
            ...classworkAssignmentInput,
            dueDate: '1618765200000',
          },
        ),
      ).rejects.toThrow('CAN_NOT_CREATE_CLASSWORK_ASSIGNMENT')

      await expect(
        classworkService.createClassworkAssignment(
          creatorAccount.id,
          objectId(),
          org.id,
          {
            ...classworkAssignmentInput,
            dueDate: '2021-05-20',
          },
        ),
      ).rejects.toThrow('CAN_NOT_CREATE_CLASSWORK_ASSIGNMENT')
    })

    it(`throws error "START_DATE_INVALID" if the entered date less than the current date`, async () => {
      expect.assertions(1)

      const org = await orgService.createOrg({
        name: 'kmin',
        namespace: 'kmin-edu',
      })

      const creatorAccount = await accountService.createAccount({
        orgId: org.id,
        email: 'lecturer@gmail.com',
        password: '123456',
        username: 'lecturer',
        roles: ['lecturer'],
        displayName: 'Lecturer',
      })

      const createCourse: ANY = {
        academicSubjectId: objectId(),
        code: 'NodeJS-12',
        name: 'Node Js Thang 12',
        tuitionFee: 5000000,
        lecturerIds: creatorAccount.id,
      }

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true as never)

      const date = new Date()

      await expect(
        classworkService.createClassworkAssignment(
          creatorAccount.id,
          createCourse.id,
          org.id,
          {
            ...classworkAssignmentInput,
            dueDate: date.setDate(date.getDate() - 1),
          },
        ),
      ).rejects.toThrow('DUE_DATE_INVALID')
    })

    it(`returns the Classwork Assignment`, async () => {
      expect.assertions(1)

      const createCourseInput: ANY = {
        academicSubjectId: objectId(),
        code: 'NodeJS-12',
        name: 'Node Js Thang 12',
        tuitionFee: 5000000,
        lecturerIds: [],
      }

      const org = await orgService.createOrg({
        namespace: 'kmin-edu',
        name: 'Kmin Academy',
      })

      const accountLecturer = await accountService.createAccount({
        orgId: org.id,
        email: 'vanhai0911@gmail.com',
        password: '123456',
        username: 'haidev',
        roles: ['lecturer'],
        displayName: 'Nguyen Van Hai',
      })

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(academicService, 'findAcademicSubjectById')
        .mockResolvedValueOnce(true as never)

      const courseTest = await academicService.createCourse(
        objectId(),
        accountLecturer.orgId,
        {
          ...createCourseInput,
          startDate: Date.now(),
          lecturerIds: [accountLecturer.id],
        },
      )

      jest
        .spyOn(academicService['courseModel'], 'findOne')
        .mockResolvedValueOnce(courseTest)
      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true as never)

      await expect(
        classworkService.createClassworkAssignment(
          accountLecturer.id,
          courseTest.id,
          org.id,
          {
            createdByAccountId: accountLecturer.id,
            title: 'Bai Tap Nay Moi Nhat',
            dueDate: '2021-07-21',
            description: '',
          },
        ),
      ).resolves.toMatchObject({
        title: 'Bai Tap Nay Moi Nhat',
      })
    })
  })

  describe('updateClassworkAssignment', () => {
    it(`throws error if couldn't find classworkAssignment to update`, async () => {
      expect.assertions(1)

      jest
        .spyOn(classworkService['classworkAssignmentsModel'], 'findOne')
        .mockResolvedValueOnce(null)

      await expect(
        classworkService.updateClassworkAssignment(
          {
            id: objectId(),
            orgId: objectId(),
            courseId: objectId(),
          },
          {
            title: 'Con meo ngu ngoc ne anh',
          },
        ),
      ).rejects.toThrowError(`Could not find classworkAssignment to update`)
    })

    it(`returns the classworkAssignment with a new title`, async () => {
      expect.assertions(1)

      const createCourseInput: ANY = {
        academicSubjectId: objectId(),
        code: 'NodeJS-12',
        name: 'Node Js Thang 12',
        tuitionFee: 5000000,
        lecturerIds: [],
      }

      const org = await orgService.createOrg({
        namespace: 'kmin-edu',
        name: 'Kmin Academy',
      })

      const accountLecturer = await accountService.createAccount({
        orgId: org.id,
        email: 'vanhai0911@gmail.com',
        password: '123456',
        username: 'haidev',
        roles: ['lecturer'],
        displayName: 'Nguyen Van Hai',
      })

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(academicService, 'findAcademicSubjectById')
        .mockResolvedValueOnce(true as never)

      const courseTest = await academicService.createCourse(
        objectId(),
        accountLecturer.orgId,
        {
          ...createCourseInput,
          startDate: Date.now(),
          lecturerIds: [accountLecturer.id],
        },
      )

      jest
        .spyOn(academicService['courseModel'], 'findOne')
        .mockResolvedValueOnce(courseTest)
      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true as never)

      const classworkAssignmentUpdate =
        await classworkService.createClassworkAssignment(
          accountLecturer.id,
          courseTest.id,
          org.id,
          {
            createdByAccountId: accountLecturer.id,
            title: 'Bai Tap Nay Moi Nhat',
            dueDate: '2021-07-21',
            description: '',
          },
        )

      jest
        .spyOn(classworkService['classworkAssignmentsModel'], 'findOne')
        .mockResolvedValueOnce(classworkAssignmentUpdate)

      await expect(
        classworkService.updateClassworkAssignment(
          {
            id: accountLecturer.id,
            orgId: org.id,
            courseId: courseTest.id,
          },
          {
            title: 'Bai Tap Nay Co Ten Moi',
          },
        ),
      ).resolves.toMatchObject({
        title: 'Bai Tap Nay Co Ten Moi',
      })
    })

    it(`returns the classworkAssignment with a new description`, async () => {
      expect.assertions(1)

      const createCourseInput: ANY = {
        academicSubjectId: objectId(),
        code: 'NodeJS-12',
        name: 'Node Js Thang 12',
        tuitionFee: 5000000,
        lecturerIds: [],
      }

      const org = await orgService.createOrg({
        namespace: 'kmin-edu',
        name: 'Kmin Academy',
      })

      const accountLecturer = await accountService.createAccount({
        orgId: org.id,
        email: 'vanhai0911@gmail.com',
        password: '123456',
        username: 'haidev',
        roles: ['lecturer'],
        displayName: 'Nguyen Van Hai',
      })

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(academicService, 'findAcademicSubjectById')
        .mockResolvedValueOnce(true as never)

      const courseTest = await academicService.createCourse(
        objectId(),
        accountLecturer.orgId,
        {
          ...createCourseInput,
          startDate: Date.now(),
          lecturerIds: [accountLecturer.id],
        },
      )

      jest
        .spyOn(academicService['courseModel'], 'findOne')
        .mockResolvedValueOnce(courseTest)
      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true as never)

      const classworkAssignmentUpdate =
        await classworkService.createClassworkAssignment(
          accountLecturer.id,
          courseTest.id,
          org.id,
          {
            createdByAccountId: accountLecturer.id,
            title: 'Bai Tap Nay Moi Nhat',
            dueDate: '2021-07-21',
            description: '',
          },
        )

      jest
        .spyOn(classworkService['classworkAssignmentsModel'], 'findOne')
        .mockResolvedValueOnce(classworkAssignmentUpdate)

      await expect(
        classworkService.updateClassworkAssignment(
          {
            id: accountLecturer.id,
            orgId: org.id,
            courseId: courseTest.id,
          },
          {
            description: 'Bai Tap Nay Co Description Moi',
          },
        ),
      ).resolves.toMatchObject({
        title: 'Bai Tap Nay Moi Nhat',
        description: 'Bai Tap Nay Co Description Moi',
      })
    })

    it(`returns the classworkAssignment with a new dueDate`, async () => {
      expect.assertions(1)

      const createCourseInput: ANY = {
        academicSubjectId: objectId(),
        code: 'NodeJS-12',
        name: 'Node Js Thang 12',
        tuitionFee: 5000000,
        lecturerIds: [],
      }

      const org = await orgService.createOrg({
        namespace: 'kmin-edu',
        name: 'Kmin Academy',
      })

      const accountLecturer = await accountService.createAccount({
        orgId: org.id,
        email: 'vanhai0911@gmail.com',
        password: '123456',
        username: 'haidev',
        roles: ['lecturer'],
        displayName: 'Nguyen Van Hai',
      })

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(academicService, 'findAcademicSubjectById')
        .mockResolvedValueOnce(true as never)

      const courseTest = await academicService.createCourse(
        objectId(),
        accountLecturer.orgId,
        {
          ...createCourseInput,
          startDate: Date.now(),
          lecturerIds: [accountLecturer.id],
        },
      )

      jest
        .spyOn(academicService['courseModel'], 'findOne')
        .mockResolvedValueOnce(courseTest)
      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true as never)

      const classworkAssignmentUpdate =
        await classworkService.createClassworkAssignment(
          accountLecturer.id,
          courseTest.id,
          org.id,
          {
            createdByAccountId: accountLecturer.id,
            title: 'Bai Tap Nay Moi Nhat',
            dueDate: '2021-07-21',
            description: '',
          },
        )

      jest
        .spyOn(classworkService['classworkAssignmentsModel'], 'findOne')
        .mockResolvedValueOnce(classworkAssignmentUpdate)

      const updateDate = await classworkService.updateClassworkAssignment(
        {
          id: accountLecturer.id,
          orgId: org.id,
          courseId: courseTest.id,
        },
        {
          dueDate: '2021-08-01',
        },
      )

      const dateUpdated = new Date(updateDate.dueDate).toString()
      const expectDate = new Date(
        new Date('2021-08-01').setHours(7, 0, 0, 0),
      ).toString()
      expect(dateUpdated).toBe(expectDate)
    })
  })
  /**
   * END CLASSWORK ASSIGNMENTS
   */
})
