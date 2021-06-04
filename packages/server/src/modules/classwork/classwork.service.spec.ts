import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { objectId, Publication } from 'core'
import { createTestingModule, initTestDb } from 'core/utils/testing'
import { AcademicService } from 'modules/academic/academic.service'
import { CreateCourseInput } from 'modules/academic/academic.type'
import { AccountService } from 'modules/account/account.service'
import { AuthService } from 'modules/auth/auth.service'
import { OrgService } from 'modules/org/org.service'
import { OrgOfficeService } from 'modules/orgOffice/orgOffice.service'
import { ANY } from 'types'

import { ClassworkService } from './classwork.service'
import {
  UpdateClassworkMaterialInput,
  CreateClassworkMaterialInput,
  CreateClassworkSubmissionInput,
} from './classwork.type'

describe('classwork.service', () => {
  let module: TestingModule
  let classworkService: ClassworkService
  let mongooseConnection: Connection
  let orgService: OrgService
  let orgOfficeService: OrgOfficeService
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
    orgOfficeService = module.get<OrgOfficeService>(OrgOfficeService)
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

    describe('findAndPaginateClassworkMaterials', () => {
      it('throws error if course is not found', async () => {
        expect.assertions(1)

        jest
          .spyOn(classworkService['courseModel'], 'findOne')
          .mockResolvedValueOnce(null)

        await expect(
          classworkService.findAndPaginateClassworkMaterials(
            {
              limit: 1,
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

      it('throws error if account have not permissions', async () => {
        expect.assertions(1)

        const createCourse: ANY = {
          academicSubjectId: objectId(),
          code: 'FECBT1',
          name: 'Frontend cơ bản tháng 1',
          startDate: Date.now().toString(),
          tuitionFee: 5000000,
          lecturerIds: [objectId()],
        }

        jest
          .spyOn(classworkService['courseModel'], 'findOne')
          .mockResolvedValueOnce(createCourse as ANY)

        await expect(
          classworkService.findAndPaginateClassworkMaterials(
            {
              limit: 2,
              skip: 1,
            },
            {
              orgId: objectId(),
              courseId: objectId(),
              accountId: objectId(),
            },
          ),
        ).rejects.toThrowError(`ACCOUNT HAVEN'T PERMISSION`)
      })

      it('returns array draft and publish classworkMaterial if account is Lecturer', async () => {
        expect.assertions(1)

        const org = await orgService.createOrg({
          name: 'kmin',
          namespace: 'kmin-edu',
        })

        const creatorAccount = await accountService.createAccount({
          orgId: org.id,
          email: 'vanhai@gmail.com',
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

        const orgOffice = await orgOfficeService.createOrgOffice({
          address: '25A Mai Thị Lưu',
          createdByAccountId: creatorAccount.id,
          name: 'Kmin Quận 1',
          orgId: org.id,
          phone: '0564125185',
        })

        const listCreateClassWorkMaterial: ANY[] = []
        const date = new Date()
        const createdByAccountId = lecturerAccount.id

        const createCourse: CreateCourseInput = {
          academicSubjectId: academicSubject.id,
          orgOfficeId: orgOffice.id,
          code: 'FECBT1',
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

        listCreateClassWorkMaterial.push(
          await classworkService.createClassworkMaterial(
            createdByAccountId,
            org.id,
            course.id,
            {
              title: 'Bai Tap So 01',
              description: 'bai tap so 01',
              attachments: [],
            },
          ),
        )

        listCreateClassWorkMaterial.push(
          await classworkService.createClassworkMaterial(
            createdByAccountId,
            org.id,
            course.id,
            {
              title: 'Bai Tap So 02',
              description: 'bai tap so 02',
              attachments: [],
            },
          ),
        )

        listCreateClassWorkMaterial.push(
          await classworkService.createClassworkMaterial(
            createdByAccountId,
            org.id,
            course.id,
            {
              title: 'Bai Tap So 03',
              description: 'bai tap so 03',
              attachments: [],
            },
          ),
        )

        await expect(
          classworkService.findAndPaginateClassworkMaterials(
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
          classworkMaterials: [
            {
              title: 'Bai Tap So 03',
            },
            {
              title: 'Bai Tap So 02',
            },
          ],
          count: listCreateClassWorkMaterial.length,
        })
      })

      it('returns array publish classworkMaterial if account is Student', async () => {
        expect.assertions(1)

        const org = await orgService.createOrg({
          name: 'kmin',
          namespace: 'kmin-edu',
        })

        const creatorAccount = await accountService.createAccount({
          orgId: org.id,
          email: 'vanhai@gmail.com',
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

        const orgOffice = await orgOfficeService.createOrgOffice({
          address: '25A Mai Thị Lưu',
          createdByAccountId: creatorAccount.id,
          name: 'Kmin Quận 1',
          orgId: org.id,
          phone: '0564125185',
        })

        const listCreateClassWorkMaterial: ANY[] = []
        const date = new Date()
        const createdByAccountId = lecturerAccount.id

        const createCourse: CreateCourseInput = {
          academicSubjectId: academicSubject.id,
          orgOfficeId: orgOffice.id,
          code: 'FECBT1',
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

        listCreateClassWorkMaterial.push(
          await classworkService.createClassworkMaterial(
            createdByAccountId,
            org.id,
            course.id,
            {
              title: 'Bai Tap So 01',
              description: 'bai tap so 01',
              attachments: [],
              publicationState: Publication.Published,
            },
          ),
        )

        listCreateClassWorkMaterial.push(
          await classworkService.createClassworkMaterial(
            createdByAccountId,
            org.id,
            course.id,
            {
              title: 'Bai Tap So 02',
              description: 'bai tap so 02',
              attachments: [],
            },
          ),
        )

        listCreateClassWorkMaterial.push(
          await classworkService.createClassworkMaterial(
            createdByAccountId,
            org.id,
            course.id,
            {
              title: 'Bai Tap So 03',
              description: 'bai tap so 03',
              attachments: [],
            },
          ),
        )

        await expect(
          classworkService.findAndPaginateClassworkMaterials(
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
          classworkMaterials: [
            {
              title: 'Bai Tap So 01',
            },
          ],
          count: listCreateClassWorkMaterial.length,
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
        orgOfficeId: objectId(),
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
        orgOfficeId: objectId(),
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
        orgOfficeId: objectId(),
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
      jest
        .spyOn(orgOfficeService, 'findOrgOfficeById')
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

      const date = new Date()

      await expect(
        classworkService.createClassworkAssignment(
          accountLecturer.id,
          courseTest.id,
          org.id,
          {
            title: 'Bai Tap Nay Moi Nhat',
            description: '',
            dueDate: date,
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

    it(`throw error if DUE_DATE_INVALID`, async () => {
      expect.assertions(1)

      const createCourseInput: ANY = {
        academicSubjectId: objectId(),
        orgOfficeId: objectId(),
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
      jest
        .spyOn(orgOfficeService, 'findOrgOfficeById')
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
            description: '',
            dueDate: new Date(),
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
            dueDate: '2020-07-21',
          },
        ),
      ).rejects.toThrowError('DUE_DATE_INVALID')
    })

    it(`returns the classworkAssignment with a new title`, async () => {
      expect.assertions(1)

      const createCourseInput: ANY = {
        academicSubjectId: objectId(),
        orgOfficeId: objectId(),
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
      jest
        .spyOn(orgOfficeService, 'findOrgOfficeById')
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
        orgOfficeId: objectId(),
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
      jest
        .spyOn(orgOfficeService, 'findOrgOfficeById')
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
        orgOfficeId: objectId(),
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
      jest
        .spyOn(orgOfficeService, 'findOrgOfficeById')
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
            description: '',
            dueDate: new Date(),
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

    it(`returns the classworkAssignment with a new dueDate if dueDate of classworkAssignment is null`, async () => {
      expect.assertions(1)

      const createCourseInput: ANY = {
        academicSubjectId: objectId(),
        orgOfficeId: objectId(),
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
      jest
        .spyOn(orgOfficeService, 'findOrgOfficeById')
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

      const orgOffice = await orgOfficeService.createOrgOffice({
        address: '25A Mai Thị Lưu',
        createdByAccountId: creatorAccount.id,
        name: 'Kmin Quận 1',
        orgId: org.id,
        phone: '0704917152',
      })

      const listCreateClassworkAssignment: ANY[] = []
      const date = new Date()
      const createdByAccountId = lecturerAccount.id

      const createCourse: CreateCourseInput = {
        academicSubjectId: academicSubject.id,
        orgOfficeId: orgOffice.id,
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
            dueDate: date,
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
            dueDate: date,
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
            dueDate: date,
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
            dueDate: date,
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
            dueDate: date,
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

      const orgOffice = await orgOfficeService.createOrgOffice({
        address: '25A Mai Thị Lưu',
        createdByAccountId: creatorAccount.id,
        name: 'Kmin Quận 1',
        orgId: org.id,
        phone: '0704917152',
      })

      const listCreateClassworkAssignment: ANY[] = []
      const date = new Date()
      const createdByAccountId = lecturerAccount.id

      const createCourse: CreateCourseInput = {
        academicSubjectId: academicSubject.id,
        orgOfficeId: orgOffice.id,
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
            dueDate: date,
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
            dueDate: date,
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
            dueDate: date,
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
            dueDate: date,
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
            dueDate: date,
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
        orgOfficeId: objectId(),
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
      jest
        .spyOn(orgOfficeService, 'findOrgOfficeById')
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
        orgOfficeId: objectId(),
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
      jest
        .spyOn(orgOfficeService, 'findOrgOfficeById')
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

      const accountAdmin = await accountService.createAccount({
        orgId: org.id,
        email: 'huynhthanhcanh1.top@gmail.com',
        password: '123456',
        username: 'thanhcanh1',
        roles: ['admin'],
        displayName: 'Huynh Thanh Canh',
      })

      const academicSubject = await academicService.createAcademicSubject({
        orgId: org.id,
        code: 'NODEJS',
        name: 'NodeJS',
        description: 'This is NodeJs',
        createdByAccountId: accountAdmin.id,
        imageFileId: objectId(),
      })

      const orgOffice = await orgOfficeService.createOrgOffice({
        name: 'Kmin Quận 1',
        address: '25A',
        createdByAccountId: accountAdmin.id,
        orgId: org.id,
        phone: '0704917152',
      })

      const createCourseInput: ANY = {
        academicSubjectId: academicSubject.id,
        orgOfficeId: orgOffice.id,
        code: 'NodeJS-12',
        name: 'Node Js Thang 12',
        tuitionFee: 5000000,
        lecturerIds: [accountLecturer.id],
      }

      const courseTest = await academicService.createCourse(
        accountAdmin.id,
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

  /**
   * END CLASSWORK SUBMISSION
   */

  describe('ClassWorkSubmission', () => {
    describe('CreateClassWorkSubmission', () => {
      const createClassWorkSubmissionInput: CreateClassworkSubmissionInput = {
        classworkId: objectId(),
        createdByAccountId: objectId(),
      }

      it('throws error if OrgId invalid', async () => {
        expect.assertions(2)

        jest
          .spyOn(classworkService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(false as ANY)
          .mockResolvedValueOnce(false as ANY)

        await expect(
          classworkService.createClassworkSubmission(
            objectId(),
            objectId(),
            createClassWorkSubmissionInput,
          ),
        ).rejects.toThrowError('ORG_ID_INVALID')

        await expect(
          classworkService.createClassworkSubmission(
            'objectId()',
            objectId(),
            createClassWorkSubmissionInput,
          ),
        ).rejects.toThrowError('ORG_ID_INVALID')
      })

      it(`throws error if account isn't a student course`, async () => {
        expect.assertions(2)

        jest
          .spyOn(classworkService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as ANY)
          .mockResolvedValueOnce(true as ANY)

        jest
          .spyOn(classworkService['authService'], 'isAccountStudentFormCourse')
          .mockResolvedValueOnce(false as ANY)
          .mockResolvedValueOnce(false as ANY)

        await expect(
          classworkService.createClassworkSubmission(
            objectId(),
            objectId(),
            createClassWorkSubmissionInput,
          ),
        ).rejects.toThrowError(`ACCOUNT_ISN'T_A_STUDENT_FORM_COURSE`)

        await expect(
          classworkService.createClassworkSubmission(
            objectId(),
            'objectId()',
            createClassWorkSubmissionInput,
          ),
        ).rejects.toThrowError(`ACCOUNT_ISN'T_A_STUDENT_FORM_COURSE`)
      })

      it(`returns the created classworkSubmission haven't files`, async () => {
        expect.assertions(2)

        jest
          .spyOn(classworkService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as never)

        jest
          .spyOn(classworkService['authService'], 'isAccountStudentFormCourse')
          .mockResolvedValueOnce(true as ANY)

        const classWorkSubmission =
          await classworkService.createClassworkSubmission(
            objectId(),
            objectId(),
            createClassWorkSubmissionInput,
          )

        await expect(
          (async (): Promise<boolean> => {
            if (!classWorkSubmission) return false
            const submission = classWorkSubmission

            if (!submission.submissionFileIds) return false
            return (
              submission.classworkId.toString() ===
              createClassWorkSubmissionInput.classworkId
            )
          })(),
        ).resolves.toBeTruthy()

        await expect(
          (async (): Promise<boolean> => {
            if (!classWorkSubmission) return false
            const submission = classWorkSubmission

            if (!submission.submissionFileIds) return false

            return (
              submission.createdByAccountId.toString() ===
              createClassWorkSubmissionInput.createdByAccountId
            )
          })(),
        ).resolves.toBeTruthy()
      })

      it(`returns the created classworkSubmission have files`, async () => {
        expect.assertions(3)

        const arrayFileIds = [objectId(), objectId()]

        jest
          .spyOn(classworkService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as never)

        jest
          .spyOn(classworkService['authService'], 'isAccountStudentFormCourse')
          .mockResolvedValueOnce(true as ANY)

        jest
          .spyOn(classworkService, 'uploadFilesAttachments')
          .mockResolvedValueOnce(arrayFileIds as ANY)

        const createInputWithFile: ANY = {
          classworkId: objectId(),
          createdByAccountId: objectId(),
          submissionFiles: arrayFileIds,
        }

        const classWorkSubmissionWithFiles =
          await classworkService.createClassworkSubmission(
            objectId(),
            objectId(),
            createInputWithFile,
          )

        await expect(
          (async (): Promise<boolean> => {
            if (!classWorkSubmissionWithFiles) return false
            const submission = classWorkSubmissionWithFiles

            if (!submission.submissionFileIds) return false
            return (
              submission.submissionFileIds[0].toString() === arrayFileIds[0]
            )
          })(),
        ).resolves.toBeTruthy()

        await expect(
          (async (): Promise<boolean> => {
            if (!classWorkSubmissionWithFiles) return false
            const submission = classWorkSubmissionWithFiles

            if (!submission.submissionFileIds) return false
            return (
              submission.submissionFileIds[1].toString() === arrayFileIds[1]
            )
          })(),
        ).resolves.toBeTruthy()

        await expect(
          (async (): Promise<boolean> => {
            if (!classWorkSubmissionWithFiles) return false
            const submission = classWorkSubmissionWithFiles

            if (!submission.submissionFileIds) return false
            return submission.submissionFileIds.length === arrayFileIds.length
          })(),
        ).resolves.toBeTruthy()
      })
    })

    describe('setGradeForClassworkSubmission', () => {
      it('throws error if OrgId invalid', async () => {
        expect.assertions(1)

        jest
          .spyOn(classworkService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(false as ANY)

        await expect(
          classworkService.setGradeForClassworkSubmission(
            objectId(),
            objectId(),
            objectId(),
            {
              submissionId: objectId(),
              grade: 70,
            },
          ),
        ).rejects.toThrowError('ORG_ID_INVALID')
      })

      it('throws error if the account is not a course lecturer', async () => {
        expect.assertions(1)

        jest
          .spyOn(classworkService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as ANY)

        await expect(
          classworkService.setGradeForClassworkSubmission(
            objectId(),
            objectId(),
            objectId(),
            {
              submissionId: objectId(),
              grade: 70,
            },
          ),
        ).rejects.toThrowError(`ACCOUNT_ISN'T_A_LECTURER_FORM_COURSE`)
      })

      it('throws error if classwork submission not found', async () => {
        expect.assertions(1)

        jest
          .spyOn(classworkService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as ANY)
        jest
          .spyOn(classworkService['authService'], 'canAccountManageCourse')
          .mockResolvedValueOnce(true as ANY)

        await expect(
          classworkService.setGradeForClassworkSubmission(
            objectId(),
            objectId(),
            objectId(),
            {
              submissionId: objectId(),
              grade: 70,
            },
          ),
        ).rejects.toThrowError(`CLASSWORK_SUBMISSION_NOT_FOUND`)
      })

      it('throws error if grade is not valid', async () => {
        expect.assertions(2)

        jest
          .spyOn(classworkService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as ANY)
          .mockResolvedValueOnce(true as ANY)
        jest
          .spyOn(classworkService['authService'], 'canAccountManageCourse')
          .mockResolvedValueOnce(true as ANY)
          .mockResolvedValueOnce(true as ANY)

        const classworkSubmission: ANY = {
          createdByAccountId: objectId(),
          classworkId: objectId(),
          grade: 0,
          submissionFileIds: [],
        }

        jest
          .spyOn(classworkService['classworkSubmissionModel'], 'findById')
          .mockResolvedValueOnce(classworkSubmission)
          .mockResolvedValueOnce(classworkSubmission)

        await expect(
          classworkService.setGradeForClassworkSubmission(
            objectId(),
            objectId(),
            objectId(),
            {
              submissionId: objectId(),
              grade: -1,
            },
          ),
        ).rejects.toThrowError(`GRADE_INVALID`)

        await expect(
          classworkService.setGradeForClassworkSubmission(
            objectId(),
            objectId(),
            objectId(),
            {
              submissionId: objectId(),
              grade: 101,
            },
          ),
        ).rejects.toThrowError(`GRADE_INVALID`)
      })

      it('returns classworkSubmission with new grade', async () => {
        expect.assertions(1)

        jest
          .spyOn(classworkService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as ANY)
          .mockResolvedValueOnce(true as ANY)
        jest
          .spyOn(classworkService['authService'], 'canAccountManageCourse')
          .mockResolvedValueOnce(true as ANY)
          .mockResolvedValueOnce(true as ANY)

        const orgId = objectId()
        const courseId = objectId()
        const gradeByAccountId = objectId()

        const classworkSubmissionInput: ANY = {
          classworkId: objectId(),
          createdByAccountId: objectId(),
        }

        jest
          .spyOn(classworkService['authService'], 'isAccountStudentFormCourse')
          .mockResolvedValueOnce(true as ANY)

        const classworkSubmission =
          await classworkService.createClassworkSubmission(
            orgId,
            courseId,
            classworkSubmissionInput,
          )

        jest
          .spyOn(classworkService['classworkSubmissionModel'], 'findById')
          .mockResolvedValueOnce(classworkSubmission)
          .mockResolvedValueOnce(classworkSubmission)

        await expect(
          classworkService.setGradeForClassworkSubmission(
            orgId,
            courseId,
            gradeByAccountId,
            {
              submissionId: classworkSubmission.id,
              grade: 100,
            },
          ),
        ).resolves.toMatchObject({
          grade: 100,
        })
      })
    })

    describe('listClassworkSubmissions', () => {
      it('throws error if OrgId invalid', async () => {
        expect.assertions(1)

        await expect(
          classworkService.listClassworkSubmissionsByClassworkAssignmentId(
            objectId(),
            objectId(),
            objectId(),
          ),
        ).rejects.toThrowError('CLASSWORKASSIGNMENT_NOT_FOUND')
      })

      it(`throws error if account can't manage course`, async () => {
        expect.assertions(1)

        jest
          .spyOn(classworkService['classworkAssignmentsModel'], 'findOne')
          .mockResolvedValueOnce({ courseId: objectId() } as ANY)

        await expect(
          classworkService.listClassworkSubmissionsByClassworkAssignmentId(
            objectId(),
            objectId(),
            objectId(),
          ),
        ).rejects.toThrowError(`ACCOUNT_CAN'T_MANAGE_COURSE`)
      })

      it(`returns an empty array ClassworkSubmissions if haven't ClassworkSubmission`, async () => {
        expect.assertions(1)

        jest
          .spyOn(classworkService['classworkAssignmentsModel'], 'findOne')
          .mockResolvedValueOnce({ courseId: objectId() } as ANY)

        jest
          .spyOn(classworkService['authService'], 'canAccountManageCourse')
          .mockResolvedValueOnce(true as never)

        await expect(
          classworkService.listClassworkSubmissionsByClassworkAssignmentId(
            objectId(),
            objectId(),
            objectId(),
          ),
        ).resolves.toMatchObject([])
      })

      it(`returns an array ClassworkSubmissions`, async () => {
        expect.assertions(1)

        const arrayClassworkSubmissions = [
          { name: '1' },
          { name: '2' },
          { name: '3' },
        ]

        jest
          .spyOn(classworkService['classworkAssignmentsModel'], 'findOne')
          .mockResolvedValueOnce({ courseId: objectId() } as ANY)

        jest
          .spyOn(classworkService['authService'], 'canAccountManageCourse')
          .mockResolvedValueOnce(true as never)

        jest
          .spyOn(classworkService['classworkSubmissionModel'], 'find')
          .mockResolvedValueOnce(arrayClassworkSubmissions as ANY)

        await expect(
          classworkService.listClassworkSubmissionsByClassworkAssignmentId(
            objectId(),
            objectId(),
            objectId(),
          ),
        ).resolves.toMatchObject(arrayClassworkSubmissions)
      })
    })
  })

  /**
   * END CLASSWORK SUBMISSION
   */
})
