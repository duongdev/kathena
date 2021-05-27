import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { objectId, Publication } from 'core'
import { createTestingModule, initTestDb } from 'core/utils/testing'
import { AcademicService } from 'modules/academic/academic.service'
import { CreateCourseInput } from 'modules/academic/academic.type'
import { AccountService } from 'modules/account/account.service'
import { AuthService } from 'modules/auth/auth.service'
import { OrgService } from 'modules/org/org.service'
import { ANY } from 'types'

import { ClassworkService } from './classwork.service'
import {
  UpdateClassworkMaterialInput,
  CreateClassworkMaterialInput,
} from './classwork.type'

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
  describe('ClassWorkMaterial', () => {
    describe('CreateClassworkMaterial', () => {
      const createClassworkMaterialInput: CreateClassworkMaterialInput = {
        title: 'NodeJs tutorial',
        description: 'string',
        publicationState: Publication.Draft,
      }

      it('throws error if OrgId invalid', async () => {
        expect.assertions(2)

        jest
          .spyOn(classworkService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(false as ANY)
          .mockResolvedValueOnce(false as ANY)

        await expect(
          classworkService.createClassworkMaterial(
            objectId(),
            objectId(),
            objectId(),
            createClassworkMaterialInput,
          ),
        ).rejects.toThrowError('ORG_ID_INVALID')

        await expect(
          classworkService.createClassworkMaterial(
            'objectId()',
            objectId(),
            objectId(),
            createClassworkMaterialInput,
          ),
        ).rejects.toThrowError('ORG_ID_INVALID')
      })

      it(`throws error if account can't manage course`, async () => {
        expect.assertions(2)

        jest
          .spyOn(classworkService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as ANY)
          .mockResolvedValueOnce(true as ANY)

        jest
          .spyOn(classworkService['authService'], 'canAccountManageCourse')
          .mockResolvedValueOnce(false as ANY)
          .mockResolvedValueOnce(false as ANY)

        await expect(
          classworkService.createClassworkMaterial(
            objectId(),
            objectId(),
            objectId(),
            createClassworkMaterialInput,
          ),
        ).rejects.toThrowError(`ACCOUNT_CAN'T_MANAGE_COURSE`)

        await expect(
          classworkService.createClassworkMaterial(
            objectId(),
            'objectId()',
            objectId(),
            createClassworkMaterialInput,
          ),
        ).rejects.toThrowError(`ACCOUNT_CAN'T_MANAGE_COURSE`)
      })

      it(`returns the created classworkMaterial`, async () => {
        expect.assertions(2)

        jest
          .spyOn(classworkService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)

        jest
          .spyOn(classworkService['authService'], 'canAccountManageCourse')
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)

        jest
          .spyOn(classworkService, 'addAttachmentsToClassworkMaterial')
          .mockResolvedValueOnce(createClassworkMaterialInput as ANY)
          .mockResolvedValueOnce({
            ...createClassworkMaterialInput,
            title: 'test 123',
          } as ANY)

        await expect(
          classworkService.createClassworkMaterial(
            objectId(),
            objectId(),
            objectId(),
            createClassworkMaterialInput,
          ),
        ).resolves.toMatchObject({
          ...createClassworkMaterialInput,
        })

        await expect(
          classworkService.createClassworkMaterial(
            objectId(),
            objectId(),
            objectId(),
            {
              title: 'test    123',
            },
          ),
        ).resolves.toMatchObject({
          title: 'test 123',
        })
      })
    })

    // TODO: Delete this line and start the code here

    // TODO: classworkService.findClassworkMaterial

    // TODO: classworkService.updateClassworkMaterial

    describe('updateClassworkMaterial', () => {
      const updateClassworkMaterialInput: UpdateClassworkMaterialInput = {
        title: 'title',
        description: 'description',
      }

      it(`throws error if classworkMaterial not found`, async () => {
        expect.assertions(1)

        jest
          .spyOn(classworkService['classworkMaterialModel'], 'findOne')
          .mockResolvedValueOnce(null as ANY)

        await expect(
          classworkService.updateClassworkMaterial(
            objectId(),
            objectId(),
            objectId(),
            updateClassworkMaterialInput,
          ),
        ).rejects.toThrowError(`CLASSWORKMATERIAL_NOT_FOUND`)
      })

      it(`throws error if account can't manage course`, async () => {
        expect.assertions(1)

        jest
          .spyOn(classworkService['classworkMaterialModel'], 'findOne')
          .mockResolvedValueOnce({ name: 'Not null' } as ANY)

        jest
          .spyOn(classworkService['authService'], 'canAccountManageCourse')
          .mockResolvedValueOnce(false as never)

        await expect(
          classworkService.updateClassworkMaterial(
            objectId(),
            objectId(),
            objectId(),
            updateClassworkMaterialInput,
          ),
        ).rejects.toThrowError(`ACCOUNT_CAN'T_MANAGE_COURSE`)
      })

      it(`returns an updated classworkMaterial`, async () => {
        expect.assertions(3)

        jest
          .spyOn(classworkService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as ANY)

        jest
          .spyOn(classworkService['authService'], 'canAccountManageCourse')
          .mockResolvedValueOnce(true as ANY)

        const classworkMaterial =
          await classworkService.createClassworkMaterial(
            objectId(),
            objectId(),
            objectId(),
            {
              description: 'description',
              title: 'title',
              publicationState: Publication.Draft,
            },
          )

        jest
          .spyOn(classworkService['authService'], 'canAccountManageCourse')
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)

        await expect(
          classworkService.updateClassworkMaterial(
            classworkMaterial.orgId,
            objectId(),
            classworkMaterial.id,
            updateClassworkMaterialInput,
          ),
        ).resolves.toMatchObject(updateClassworkMaterialInput)

        await expect(
          classworkService.updateClassworkMaterial(
            classworkMaterial.orgId,
            objectId(),
            classworkMaterial.id,
            {
              title: 'Đặng  Hiếu Liêm',
            },
          ),
        ).resolves.toMatchObject({
          title: 'Đặng Hiếu Liêm',
        })

        await expect(
          classworkService.updateClassworkMaterial(
            classworkMaterial.orgId,
            objectId(),
            classworkMaterial.id,
            {
              description: 'Đặng  Hiếu Liêm',
            },
          ),
        ).resolves.toMatchObject({
          description: 'Đặng Hiếu Liêm',
        })
      })
    })

    // TODO: classworkService.updateClassworkMaterialPublication

    describe('updateClassworkMaterialPublication', () => {
      it(`throws error if classworkMaterial not found`, async () => {
        expect.assertions(1)

        jest
          .spyOn(classworkService['classworkMaterialModel'], 'findOne')
          .mockResolvedValueOnce(null as ANY)

        await expect(
          classworkService.updateClassworkMaterialPublication(
            {
              orgId: objectId(),
              accountId: objectId(),
              classworkMaterialId: objectId(),
            },
            Publication.Draft,
          ),
        ).rejects.toThrowError(`CLASSWORKMATERIAL_NOT_FOUND`)
      })

      it(`throws error if account can't manage course`, async () => {
        expect.assertions(1)

        jest
          .spyOn(classworkService['classworkMaterialModel'], 'findOne')
          .mockResolvedValueOnce({ name: 'Not null' } as ANY)

        jest
          .spyOn(classworkService['authService'], 'canAccountManageCourse')
          .mockResolvedValueOnce(false as never)

        await expect(
          classworkService.updateClassworkMaterialPublication(
            {
              orgId: objectId(),
              accountId: objectId(),
              classworkMaterialId: objectId(),
            },
            Publication.Draft,
          ),
        ).rejects.toThrowError(`ACCOUNT_CAN'T_MANAGE_COURSE`)
      })

      it(`throws error if can't update classworkMaterial`, async () => {
        expect.assertions(1)

        jest
          .spyOn(classworkService['classworkMaterialModel'], 'findOne')
          .mockResolvedValueOnce({ name: 'Not null' } as ANY)

        jest
          .spyOn(classworkService['authService'], 'canAccountManageCourse')
          .mockResolvedValueOnce(true as never)

        jest
          .spyOn(
            classworkService['classworkMaterialModel'],
            'findByIdAndUpdate',
          )
          .mockResolvedValueOnce(null as ANY)

        await expect(
          classworkService.updateClassworkMaterialPublication(
            {
              orgId: objectId(),
              accountId: objectId(),
              classworkMaterialId: objectId(),
            },
            Publication.Draft,
          ),
        ).rejects.toThrowError(`CAN'T_UPDATE_CLASSMATERIAL_PUBLICATION`)
      })

      it(`returns an updated classworkMaterial`, async () => {
        expect.assertions(2)

        jest
          .spyOn(classworkService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as ANY)

        jest
          .spyOn(classworkService['authService'], 'canAccountManageCourse')
          .mockResolvedValueOnce(true as ANY)

        const classworkMaterial =
          await classworkService.createClassworkMaterial(
            objectId(),
            objectId(),
            objectId(),
            {
              description: 'description',
              title: 'title',
              publicationState: Publication.Draft,
            },
          )

        jest
          .spyOn(classworkService['authService'], 'canAccountManageCourse')
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)

        await expect(
          classworkService.updateClassworkMaterialPublication(
            {
              orgId: classworkMaterial.orgId,
              accountId: objectId(),
              classworkMaterialId: classworkMaterial.id,
            },
            Publication.Draft,
          ),
        ).resolves.toMatchObject({
          publicationState: Publication.Draft,
        })

        await expect(
          classworkService.updateClassworkMaterialPublication(
            {
              orgId: classworkMaterial.orgId,
              accountId: objectId(),
              classworkMaterialId: classworkMaterial.id,
            },
            Publication.Published,
          ),
        ).resolves.toMatchObject({
          publicationState: Publication.Published,
        })
      })
    })

    // TODO: classworkService.removeAttachmentsFromClassworkMaterial

    // TODO: classworkService.findClassworkMaterialById

    describe('findClassworkMaterialById', () => {
      it('throws error if the classworkMaterial not found', async () => {
        expect.assertions(1)

        await expect(
          classworkService.findClassworkMaterialById(objectId(), objectId()),
        ).rejects.toThrow(`ClassworkMaterial not found`)
      })

      it('returns a classworkMaterial', async () => {
        expect.assertions(1)

        const orgId = objectId()

        jest
          .spyOn(classworkService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as ANY)

        jest
          .spyOn(classworkService['authService'], 'canAccountManageCourse')
          .mockResolvedValueOnce(true as ANY)

        const classworkMaterial =
          await classworkService.createClassworkMaterial(
            objectId(),
            orgId,
            objectId(),
            {
              title: 'Bai Tap Nay Moi Ne',
            },
          )

        await expect(
          classworkService.findClassworkMaterialById(
            orgId,
            classworkMaterial.id,
          ),
        ).resolves.toMatchObject({
          title: 'Bai Tap Nay Moi Ne',
        })
      })
    })
  })
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
            accountId: objectId(),
            orgId: objectId(),
          },
          {
            title: 'Con meo ngu ngoc ne anh',
          },
        ),
      ).rejects.toThrowError(`Could not find classworkAssignment to update`)
    })

    it(`throws error if account can't manage course`, async () => {
      expect.assertions(1)

      const classworkAssignmentId = objectId()
      const orgIdTest = objectId()

      jest
        .spyOn(classworkService['classworkAssignmentsModel'], 'findOne')
        .mockResolvedValueOnce(true as never)

      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(false as never)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      await expect(
        classworkService.updateClassworkAssignment(
          {
            id: classworkAssignmentId,
            accountId: objectId(),
            orgId: orgIdTest,
          },
          {
            title: 'Con meo ngu ngoc ne anh',
          },
        ),
      ).rejects.toThrowError(`ACCOUNT_CAN'T_MANAGE_COURSE`)
    })

    it(`throw error if start date invalid`, async () => {
      expect.assertions(1)

      const classworkAssignmentId = objectId()
      const orgIdTest = objectId()
      const accountIdTest = objectId()

      jest
        .spyOn(classworkService['classworkAssignmentsModel'], 'findOne')
        .mockResolvedValueOnce(true as never)

      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true as never)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      await expect(
        classworkService.updateClassworkAssignment(
          {
            id: classworkAssignmentId,
            accountId: accountIdTest,
            orgId: orgIdTest,
          },
          {
            dueDate: '2020-07-21',
          },
        ),
      ).rejects.toThrowError('START_DATE_INVALID')
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
            title: 'Bai Tap 01',
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
            id: classworkAssignmentUpdate.id,
            accountId: accountLecturer.id,
            orgId: org.id,
          },
          {
            title: 'Day La Bai Tap Moi',
          },
        ),
      ).resolves.toMatchObject({
        title: 'Day La Bai Tap Moi',
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
            title: 'Bai Tap Nay Moi',
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
            id: classworkAssignmentUpdate.id,
            accountId: accountLecturer.id,
            orgId: org.id,
          },
          {
            description: 'Bai Tap Nay Moi Them Description',
          },
        ),
      ).resolves.toMatchObject({
        title: 'Bai Tap Nay Moi',
        description: 'Bai Tap Nay Moi Them Description',
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
          id: classworkAssignmentUpdate.id,
          accountId: accountLecturer.id,
          orgId: org.id,
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

  describe('findAndPaginateClassworkAssignments', () => {
    it(`throws error if course isn't found`, async () => {
      expect.assertions(1)

      jest
        .spyOn(classworkService['courseModel'], 'findOne')
        .mockResolvedValueOnce(null)

      await expect(
        classworkService.findAndPaginateClassworkAssignments(
          {
            limit: 2,
            skip: 0,
          },
          {
            orgId: objectId(),
            accountId: objectId(),
            courseId: objectId(),
          },
        ),
      ).rejects.toThrowError(`COURSE NOT FOUND`)
    })

    it('returns array publish and draft classworkAssignment if the account is lecturer', async () => {
      expect.assertions(1)

      const org = await orgService.createOrg({
        name: 'kmin',
        namespace: 'kmin-edu',
      })

      const creatorAccount = await accountService.createAccount({
        orgId: org.id,
        email: 'admin@gmail.com',
        password: '123456',
        username: 'admin',
        roles: ['admin'],
        displayName: 'Admin',
      })

      const lecturerAccount = await accountService.createAccount({
        orgId: org.id,
        email: 'lecturer@gmail.com',
        password: '123456',
        username: 'lecturer',
        roles: ['lecturer'],
        displayName: 'Lecturer',
      })

      const academicSubject = await academicService.createAcademicSubject({
        code: 'HTML',
        createdByAccountId: creatorAccount.id,
        description: 'HTML',
        imageFileId: objectId(),
        name: 'HTMl',
        orgId: org.id,
      })

      const listCreateClassworkAssignment: ANY[] = []
      const date = new Date()
      const createdByAccountId = lecturerAccount.id

      const createCourse: CreateCourseInput = {
        academicSubjectId: academicSubject.id,
        code: 'FEBCT1',
        name: 'Frontend cơ bản tháng 1',
        startDate: date.toString(),
        tuitionFee: 5000000,
        lecturerIds: [lecturerAccount.id],
      }

      const course = await academicService.createCourse(
        creatorAccount.id,
        org.id,
        {
          ...createCourse,
        },
      )

      listCreateClassworkAssignment.push(
        await classworkService.createClassworkAssignment(
          createdByAccountId,
          course.id,
          org.id,
          {
            title: 'Bai tap 1',
            description: 'Bai tap 1',
            attachments: [],
            dueDate: date.toString(),
          },
        ),
      )

      listCreateClassworkAssignment.push(
        await classworkService.createClassworkAssignment(
          createdByAccountId,
          course.id,
          org.id,
          {
            title: 'Bai tap 2',
            description: 'Bai tap 2',
            attachments: [],
            dueDate: date.toString(),
          },
        ),
      )

      listCreateClassworkAssignment.push(
        await classworkService.createClassworkAssignment(
          createdByAccountId,
          course.id,
          org.id,
          {
            title: 'Bai tap 3',
            description: 'Bai tap 3',
            attachments: [],
            dueDate: date.toString(),
          },
        ),
      )

      listCreateClassworkAssignment.push(
        await classworkService.createClassworkAssignment(
          createdByAccountId,
          course.id,
          org.id,
          {
            title: 'Bai tap 4',
            description: 'Bai tap 4',
            attachments: [],
            dueDate: date.toString(),
          },
        ),
      )

      listCreateClassworkAssignment.push(
        await classworkService.createClassworkAssignment(
          createdByAccountId,
          course.id,
          org.id,
          {
            title: 'Bai tap 5',
            description: 'Bai tap 5',
            attachments: [],
            dueDate: date.toString(),
          },
        ),
      )

      await expect(
        classworkService.findAndPaginateClassworkAssignments(
          {
            limit: 2,
            skip: 0,
          },
          {
            orgId: org.id,
            accountId: lecturerAccount.id,
            courseId: course.id,
          },
        ),
      ).resolves.toMatchObject({
        classworkAssignments: [
          {
            title: 'Bai tap 5',
            description: 'Bai tap 5',
          },
          {
            title: 'Bai tap 4',
            description: 'Bai tap 4',
          },
        ],
        count: listCreateClassworkAssignment.length,
      })
    })

    it('returns array publish classworkAssignment if the account is student', async () => {
      expect.assertions(1)

      const org = await orgService.createOrg({
        name: 'kmin',
        namespace: 'kmin-edu',
      })

      const creatorAccount = await accountService.createAccount({
        orgId: org.id,
        email: 'admin@gmail.com',
        password: '123456',
        username: 'admin',
        roles: ['admin'],
        displayName: 'Admin',
      })

      const lecturerAccount = await accountService.createAccount({
        orgId: org.id,
        email: 'lecturer@gmail.com',
        password: '123456',
        username: 'lecturer',
        roles: ['lecturer'],
        displayName: 'Lecturer',
      })

      const studentAccount = await accountService.createAccount({
        orgId: org.id,
        email: 'student@gmail.com',
        password: '123456',
        username: 'student',
        roles: ['student'],
        displayName: 'Student',
      })

      const academicSubject = await academicService.createAcademicSubject({
        code: 'HTML',
        createdByAccountId: creatorAccount.id,
        description: 'HTML',
        imageFileId: objectId(),
        name: 'HTMl',
        orgId: org.id,
      })

      const listCreateClassworkAssignment: ANY[] = []
      const date = new Date()
      const createdByAccountId = lecturerAccount.id

      const createCourse: CreateCourseInput = {
        academicSubjectId: academicSubject.id,
        code: 'FEBCT1',
        name: 'Frontend cơ bản tháng 1',
        startDate: date.toString(),
        tuitionFee: 5000000,
        lecturerIds: [lecturerAccount.id],
      }

      const course = await academicService.createCourse(
        creatorAccount.id,
        org.id,
        {
          ...createCourse,
        },
      )
      course.studentIds = [studentAccount.id]
      course.save()

      listCreateClassworkAssignment.push(
        await classworkService.createClassworkAssignment(
          createdByAccountId,
          course.id,
          org.id,
          {
            title: 'Bai tap 1',
            description: 'Bai tap 1',
            attachments: [],
            dueDate: date.toString(),
            publicationState: Publication.Published,
          },
        ),
      )

      listCreateClassworkAssignment.push(
        await classworkService.createClassworkAssignment(
          createdByAccountId,
          course.id,
          org.id,
          {
            title: 'Bai tap 2',
            description: 'Bai tap 2',
            attachments: [],
            dueDate: date.toString(),
            publicationState: Publication.Published,
          },
        ),
      )

      listCreateClassworkAssignment.push(
        await classworkService.createClassworkAssignment(
          createdByAccountId,
          course.id,
          org.id,
          {
            title: 'Bai tap 3',
            description: 'Bai tap 3',
            attachments: [],
            dueDate: date.toString(),
          },
        ),
      )

      listCreateClassworkAssignment.push(
        await classworkService.createClassworkAssignment(
          createdByAccountId,
          course.id,
          org.id,
          {
            title: 'Bai tap 4',
            description: 'Bai tap 4',
            attachments: [],
            dueDate: date.toString(),
          },
        ),
      )

      listCreateClassworkAssignment.push(
        await classworkService.createClassworkAssignment(
          createdByAccountId,
          course.id,
          org.id,
          {
            title: 'Bai tap 5',
            description: 'Bai tap 5',
            attachments: [],
            dueDate: date.toString(),
          },
        ),
      )

      await expect(
        classworkService.findAndPaginateClassworkAssignments(
          {
            limit: 2,
            skip: 0,
          },
          {
            orgId: org.id,
            accountId: studentAccount.id,
            courseId: course.id,
          },
        ),
      ).resolves.toMatchObject({
        classworkAssignments: [
          {
            title: 'Bai tap 2',
            description: 'Bai tap 2',
          },
          {
            title: 'Bai tap 1',
            description: 'Bai tap 1',
          },
        ],
        count: listCreateClassworkAssignment.length,
      })
    })

    it(`throws error if account haven't permission`, async () => {
      expect.assertions(1)

      const createCourse: ANY = {
        academicSubjectId: objectId(),
        code: 'FEBCT1',
        name: 'Frontend cơ bản tháng 1',
        startDate: Date.now().toString(),
        tuitionFee: 5000000,
        lecturerIds: [objectId()],
      }

      jest
        .spyOn(classworkService['courseModel'], 'findOne')
        .mockResolvedValueOnce(createCourse as ANY)

      await expect(
        classworkService.findAndPaginateClassworkAssignments(
          {
            limit: 2,
            skip: 0,
          },
          {
            orgId: objectId(),
            accountId: objectId(),
            courseId: objectId(),
          },
        ),
      ).rejects.toThrowError(`ACCOUNT HAVEN'T PERMISSION`)
    })
  })

  describe('updateClassworkAssignmentPublication', () => {
    it(`throws error if couldn't find classworkAssignment to update publicationState`, async () => {
      expect.assertions(1)

      await expect(
        classworkService.updateClassworkAssignmentPublication(
          {
            id: objectId(),
            accountId: objectId(),
            orgId: objectId(),
          },
          Publication.Draft,
        ),
      ).rejects.toThrow(
        `Couldn't find classworkAssignment to update publicationState`,
      )
    })

    it(`throws error if account can't manage course`, async () => {
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

      const classworkAssignmentTest =
        await classworkService.createClassworkAssignment(
          accountLecturer.id,
          courseTest.id,
          org.id,
          {
            title: 'Bai Tap Nay Moi Nhat',
            dueDate: '2021-07-21',
            description: '',
          },
        )

      jest
        .spyOn(classworkService['classworkAssignmentsModel'], 'findById')
        .mockResolvedValueOnce(classworkAssignmentTest)

      await expect(
        classworkService.updateClassworkAssignmentPublication(
          {
            id: classworkAssignmentTest.id,
            accountId: objectId(),
            orgId: org.id,
          },
          Publication.Published,
        ),
      ).rejects.toThrowError(`ACCOUNT_CAN'T_MANAGE_COURSE`)
    })

    it(`returns the classworkAssignment with new publication`, async () => {
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

      const classworkAssignmentTest =
        await classworkService.createClassworkAssignment(
          accountLecturer.id,
          courseTest.id,
          org.id,
          {
            title: 'Bai Tap Nay Moi Nhat',
            dueDate: '2021-07-21',
            description: '',
          },
        )

      jest
        .spyOn(classworkService['classworkAssignmentsModel'], 'findById')
        .mockResolvedValueOnce(classworkAssignmentTest)

      await expect(
        classworkService.updateClassworkAssignmentPublication(
          {
            id: classworkAssignmentTest.id,
            accountId: accountLecturer.id,
            orgId: org.id,
          },
          Publication.Published,
        ),
      ).resolves.toMatchObject({
        title: 'Bai Tap Nay Moi Nhat',
        publicationState: Publication.Published,
      })
    })
  })

  describe('findClassworkAssignmentById', () => {
    it('throws error if the classworkAssignment not found', async () => {
      expect.assertions(1)

      await expect(
        classworkService.findClassworkAssignmentById(objectId(), objectId()),
      ).rejects.toThrowError(`ClassworkAssignment not found.`)
    })

    it('returns a classworkAssignment', async () => {
      expect.assertions(1)

      const org = await orgService.createOrg({
        namespace: 'kmin-edu',
        name: 'Kmin Academy',
      })

      const accountLecturer = await accountService.createAccount({
        orgId: org.id,
        email: 'huynhthanhcanh.top@gmail.com',
        password: '123456',
        username: 'thanhcanh',
        roles: ['lecturer'],
        displayName: 'Huynh Thanh Canh',
      })

      const accountStaff = await accountService.createAccount({
        orgId: org.id,
        email: 'huynhthanhcanh1.top@gmail.com',
        password: '123456',
        username: 'thanhcanh1',
        roles: ['staff'],
        displayName: 'Huynh Thanh Canh',
      })

      const academicSubject = await academicService.createAcademicSubject({
        orgId: org.id,
        code: 'NODEJS',
        name: 'NodeJS',
        description: 'This is NodeJs',
        createdByAccountId: accountStaff.id,
        imageFileId: objectId(),
      })

      const createCourseInput: ANY = {
        academicSubjectId: academicSubject.id,
        code: 'NodeJS-12',
        name: 'Node Js Thang 12',
        tuitionFee: 5000000,
        lecturerIds: [accountLecturer.id],
      }

      const courseTest = await academicService.createCourse(
        accountStaff.id,
        accountLecturer.orgId,
        {
          ...createCourseInput,
          startDate: Date.now(),
          lecturerIds: [accountLecturer.id],
        },
      )

      const classworkAssignment =
        await classworkService.createClassworkAssignment(
          accountLecturer.id,
          courseTest.id,
          org.id,
          {
            title: 'Bai Tap Nay Moi Nhat',
            dueDate: '2021-07-21',
            description: 'Day la bai tap moi nhat',
          },
        )

      await expect(
        classworkService.findClassworkAssignmentById(
          org.id,
          classworkAssignment.id,
        ),
      ).resolves.toMatchObject({
        title: 'Bai Tap Nay Moi Nhat',
        description: 'Day la bai tap moi nhat',
      })
    })
  })
  /**
   * END CLASSWORK ASSIGNMENTS
   */
})
