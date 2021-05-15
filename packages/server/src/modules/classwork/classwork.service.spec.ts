import { TestingModule } from '@nestjs/testing'
// import { compareSync } from 'bcrypt'
import { Connection } from 'mongoose'

// import { objectId } from 'core/utils/db'
import { objectId } from 'core/utils/db'
import { createTestingModule, initTestDb } from 'core/utils/testing'
// import { Role } from 'modules/auth/models'
// import { ANY } from 'types'

import { AcademicService } from 'modules/academic/academic.service'
import { CreateCourseInput } from 'modules/academic/academic.type'
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

    // it(`throws error "CAN_NOT_CREATE_CLASSWORK_ASSIGNMENT" if Account or Course is not found`, async () => {
    //   expect.assertions(1)

    //   const org = await orgService.createOrg({
    //     name: 'kmin',
    //     namespace: 'kmin-edu',
    //   })

    //   const creatorAccount = await accountService.createAccount({
    //     orgId: org.id,
    //     email: 'lecturer@gmail.com',
    //     password: '123456',
    //     username: 'lecturer',
    //     roles: ['lecturer'],
    //     displayName: 'Lecturer',
    //   })

    //   jest
    //     .spyOn(orgService, 'validateOrgId')
    //     .mockRejectedValueOnce(true as never)

    //   await expect(
    //     classworkService.createClassworkAssignment(
    //       creatorAccount.id,
    //       objectId(),
    //       org.id,
    //       {
    //         ...classworkAssignmentInput,
    //         dueDate: '1618765200000',
    //       },
    //     ),
    //   ).rejects.toThrowError('CAN_NOT_CREATE_CLASSWORK_ASSIGNMENT')
    // })

    // it(`returns the new Classwork Assignment`, async () => {
    //   expect.assertions(1)

    //   const createCourseInput: ANY = {
    //     academicSubjectId: objectId(),
    //     code: 'NodeJS-12',
    //     name: 'Node Js Thang 12',
    //     tuitionFee: 5000000,
    //     lecturerIds: [],
    //   }

    //   const org = await orgService.createOrg({
    //     namespace: 'kmin-edu',
    //     name: 'Kmin Academy',
    //   })

    //   const accountLecturer = await accountService.createAccount({
    //     orgId: org.id,
    //     email: 'vanhai0911@gmail.com',
    //     password: '123456',
    //     username: 'haidev',
    //     roles: ['lecturer'],
    //     displayName: 'Nguyen Van Hai',
    //   })

    //   jest
    //     .spyOn(orgService, 'validateOrgId')
    //     .mockResolvedValueOnce(true as never)
    //   jest
    //     .spyOn(authService, 'accountHasPermission')
    //     .mockResolvedValueOnce(true as never)
    //   jest
    //     .spyOn(academicService, 'findAcademicSubjectById')
    //     .mockResolvedValueOnce(true as never)

    //   const courseTest = await academicService.createCourse(
    //     objectId(),
    //     accountLecturer.orgId,
    //     {
    //       ...createCourseInput,
    //       startDate: Date.now(),
    //       lecturerIds: [accountLecturer.id],
    //     },
    //   )

    //   jest
    //     .spyOn(academicService['courseModel'], 'findOne')
    //     .mockResolvedValueOnce(courseTest)
    //   jest
    //     .spyOn(authService, 'canAccountManageCourse')
    //     .mockRejectedValueOnce(true as never)

    //   await expect(
    //     classworkService.createClassworkAssignment(
    //       accountLecturer.id,
    //       courseTest.id,
    //       org.id,
    //       {
    //         createdByAccountId: accountLecturer.id,
    //         title: 'Bai Tap Nay Moi Nhat',
    //         dueDate: '2021-07-21',
    //         description: '',
    //       },
    //     ),
    //   ).resolves.toMatchObject({
    //     title: 'Bai Tap Nay Moi Nhat',
    //   })
    // })
  })

  /**
   * END CLASSWORK ASSIGNMENTS
   */
})
