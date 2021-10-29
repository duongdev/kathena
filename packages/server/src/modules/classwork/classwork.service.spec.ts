import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { Publication } from 'core'
import { objectId } from 'core/utils/db'
import { createTestingModule, initTestDb } from 'core/utils/testing'
import { AcademicService } from 'modules/academic/academic.service'
import { AccountService } from 'modules/account/account.service'
import { AuthService } from 'modules/auth/auth.service'
import { CourseService } from 'modules/course/course.service'
import { CreateCourseInput } from 'modules/course/course.type'
import { OrgService } from 'modules/org/org.service'
import { OrgOfficeService } from 'modules/orgOffice/orgOffice.service'
import { ANY } from 'types'

import { ClassworkService } from './classwork.service'
import {
  UpdateClassworkMaterialInput,
  CreateClassworkMaterialInput,
  CreateClassworkSubmissionInput,
  ClassworkAssignmentByStudentIdInCourseInputStatus,
  ClassworkAssignmentByStudentIdInCourseInput,
  ClassworkAssignmentByStudentIdInCourseResponsePayload,
  ClassworkAssignmentByStudentIdInCourseResponse,
} from './classwork.type'
import { ClassworkSubmissionStatus } from './models/ClassworkSubmission'

describe('classwork.service', () => {
  let module: TestingModule
  let classworkService: ClassworkService
  let mongooseConnection: Connection
  let orgService: OrgService
  let orgOfficeService: OrgOfficeService
  let authService: AuthService
  let accountService: AccountService
  let courseService: CourseService
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
    courseService = module.get<CourseService>(CourseService)
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

  const videos: ANY = [
    {
      title: 'video 1',
      iframe: 'iframe 1',
    },
    {
      title: 'video 2',
      iframe: 'iframe 2',
    },
    {
      title: 'video 3',
      iframe: 'iframe 3',
    },
  ]
  /**
   * START CLASSWORK MATERIAL
   */
  describe('ClassWorkMaterial', () => {
    beforeEach(async () => {
      await mongooseConnection.dropDatabase()
      jest.resetAllMocks()
      jest.restoreAllMocks()
    })

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
          .mockResolvedValueOnce(true as never)

        jest
          .spyOn(classworkService['authService'], 'canAccountManageCourse')
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)

        await expect(
          classworkService.createClassworkMaterial(
            objectId(),
            objectId(),
            objectId(),
            createClassworkMaterialInput,
          ),
        ).resolves.toMatchObject(createClassworkMaterialInput)

        await expect(
          classworkService.createClassworkMaterial(
            objectId(),
            objectId(),
            objectId(),
            {
              title: 'test    123',
              publicationState: Publication.Published,
            },
          ),
        ).resolves.toMatchObject({
          title: 'test 123',
          publicationState: Publication.Published,
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

        const classworkMaterialvideos =
          await classworkService.createClassworkMaterial(
            objectId(),
            objectId(),
            objectId(),
            {
              title: 'Bai Tap Nay Moi Nhat 1',
              description: '',
              videos: [videos[0], videos[1]],
            },
          )

        await expect(
          (async (): Promise<ANY> => {
            return classworkMaterialvideos.videos?.length
          })(),
        ).resolves.toBe(2)
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
      it(`returns null if Id doesn't exist`, async () => {
        expect.assertions(1)

        await expect(
          classworkService.findClassworkMaterialById(objectId(), objectId()),
        ).resolves.toBeNull()
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
          startDate: new Date(),
          tuitionFee: 5000000,
          lecturerIds: [objectId()],
          daysOfTheWeek: [],
          orgOfficeId: objectId(),
          totalNumberOfLessons: 0,
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
        academicSubject.publication = Publication.Published
        await academicSubject.save()

        const orgOffice = await orgOfficeService.createOrgOffice({
          address: '25A Mai Thị Lưu',
          createdByAccountId: creatorAccount.id,
          name: 'Kmin Quận 1',
          orgId: org.id,
          phone: '0564125185',
        })

        const listCreateClassWorkMaterial: ANY[] = []
        const createdByAccountId = lecturerAccount.id

        const createCourse: CreateCourseInput = {
          academicSubjectId: academicSubject.id,
          orgOfficeId: orgOffice.id,
          code: 'FECBT1',
          name: 'Frontend cơ bản tháng 1',
          startDate: new Date(),
          tuitionFee: 5000000,
          lecturerIds: [lecturerAccount.id],
          daysOfTheWeek: [],
          totalNumberOfLessons: 0,
        }

        const course = await courseService.createCourse(
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
          name: 'kmin 2',
          namespace: 'kmin-edu-2',
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
        academicSubject.publication = Publication.Published
        await academicSubject.save()

        const orgOffice = await orgOfficeService.createOrgOffice({
          address: '25A Mai Thị Lưu',
          createdByAccountId: creatorAccount.id,
          name: 'Kmin Quận 1',
          orgId: org.id,
          phone: '0564125185',
        })

        const listCreateClassWorkMaterial: ANY[] = []
        const createdByAccountId = lecturerAccount.id

        const createCourse: CreateCourseInput = {
          academicSubjectId: academicSubject.id,
          orgOfficeId: orgOffice.id,
          code: 'FECBT1',
          name: 'Frontend cơ bản tháng 1',
          startDate: new Date(),
          tuitionFee: 5000000,
          lecturerIds: [lecturerAccount.id],
          daysOfTheWeek: [],
          totalNumberOfLessons: 0,
        }

        const course = await courseService.createCourse(
          creatorAccount.id,
          org.id,
          createCourse,
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

        const countClassworkPublic = 1

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
          count: countClassworkPublic,
        })
      })
    })

    describe('cloneClassworkMaterialFromClassworkMaterialId', () => {
      it(`throws error if from classwork material not found`, async () => {
        expect.assertions(1)
        await expect(
          classworkService.cloneClassworkMaterialFromClassworkMaterialId(
            objectId(),
            objectId(),
            objectId(),
            objectId(),
          ),
        ).rejects.toThrowError(`FORMCLASSWORKMATERIAL_NOT_FOUND`)
      })

      it(`throws error if to course not found`, async () => {
        expect.assertions(1)
        jest
          .spyOn(classworkService, 'findClassworkMaterialById')
          .mockResolvedValueOnce({ id: objectId() } as ANY)

        await expect(
          classworkService.cloneClassworkMaterialFromClassworkMaterialId(
            objectId(),
            objectId(),
            objectId(),
            objectId(),
          ),
        ).rejects.toThrowError(`TOCOURSE_NOT_FOUND`)
      })

      it(`throws error if account can't manage course`, async () => {
        expect.assertions(1)
        jest
          .spyOn(classworkService, 'findClassworkMaterialById')
          .mockResolvedValueOnce({ id: objectId() } as ANY)
        jest
          .spyOn(courseService, 'findCourseById')
          .mockResolvedValueOnce({ id: objectId() } as ANY)
        await expect(
          classworkService.cloneClassworkMaterialFromClassworkMaterialId(
            objectId(),
            objectId(),
            objectId(),
            objectId(),
          ),
        ).rejects.toThrowError(`ACCOUNT_CAN'T_MANAGE_COURSE`)
      })

      it(`returns new clone ClassworkMaterial`, async () => {
        expect.assertions(1)
        const classwork = {
          id: objectId(),
          title: 'classwork 1',
          description: 'description classwork 1',
          publicationState: Publication.Draft,
          attachments: [objectId(), objectId()],
        }
        jest
          .spyOn(classworkService, 'findClassworkMaterialById')
          .mockResolvedValueOnce(classwork as ANY)
        jest
          .spyOn(courseService, 'findCourseById')
          .mockResolvedValueOnce({ id: objectId() } as ANY)
        jest
          .spyOn(authService, 'canAccountManageCourse')
          .mockResolvedValueOnce(true as never)
        jest
          .spyOn(classworkService, 'createClassworkMaterial')
          .mockResolvedValueOnce(classwork as ANY)
        jest
          .spyOn(
            classworkService['classworkMaterialModel'],
            'findByIdAndUpdate',
          )
          .mockResolvedValueOnce(classwork as ANY)

        await expect(
          classworkService.cloneClassworkMaterialFromClassworkMaterialId(
            objectId(),
            objectId(),
            objectId(),
            objectId(),
          ),
        ).resolves.toMatchObject(classwork)
      })
    })
  })
  /**
   * END CLASSWORK MATERIAL
   */

  /**
   * START CLASSWORK ASSIGNMENTS
   */

  describe('ClassworkAssignment', () => {
    beforeEach(async () => {
      await mongooseConnection.dropDatabase()
      jest.resetAllMocks()
      jest.restoreAllMocks()
    })

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
        expect.assertions(2)

        const createCourseInput: CreateCourseInput = {
          academicSubjectId: objectId(),
          orgOfficeId: objectId(),
          code: 'NodeJS-12',
          name: 'Node Js Thang 12',
          tuitionFee: 5000000,
          lecturerIds: [],
          startDate: new Date(),
          daysOfTheWeek: [],
          totalNumberOfLessons: 0,
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
          .mockResolvedValueOnce(true as never)
        jest
          .spyOn(authService, 'accountHasPermission')
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)
        jest
          .spyOn(academicService, 'findAcademicSubjectById')
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)
        jest
          .spyOn(orgOfficeService, 'findOrgOfficeById')
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)

        const courseTest = await courseService.createCourse(
          objectId(),
          accountLecturer.orgId,
          {
            ...createCourseInput,
            startDate: new Date(),
            lecturerIds: [accountLecturer.id],
          },
        )

        jest
          .spyOn(authService, 'canAccountManageCourse')
          .mockResolvedValueOnce(true as never)
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

        const classworkAssignmentWithvideos =
          await classworkService.createClassworkAssignment(
            accountLecturer.id,
            courseTest.id,
            org.id,
            {
              title: 'Bai Tap Nay Moi Nhat 1',
              description: '',
              dueDate: date,
              videos: [videos[0], videos[1]],
            },
          )

        await expect(
          (async (): Promise<ANY> => {
            return classworkAssignmentWithvideos.videos?.length
          })(),
        ).resolves.toBe(2)
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

        const createCourseInput: CreateCourseInput = {
          academicSubjectId: objectId(),
          orgOfficeId: objectId(),
          code: 'NodeJS-12',
          name: 'Node Js Thang 12',
          tuitionFee: 5000000,
          lecturerIds: [],
          startDate: new Date(),
          daysOfTheWeek: [],
          totalNumberOfLessons: 0,
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

        const courseTest = await courseService.createCourse(
          objectId(),
          accountLecturer.orgId,
          {
            ...createCourseInput,
            lecturerIds: [accountLecturer.id],
          },
        )

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
              dueDate: new Date('2021-07-28'),
            },
          ),
        ).rejects.toThrowError('DUE_DATE_INVALID')
      })

      it(`returns the classworkAssignment with a new title`, async () => {
        expect.assertions(1)

        const createCourseInput: CreateCourseInput = {
          academicSubjectId: objectId(),
          orgOfficeId: objectId(),
          code: 'NodeJS-12',
          name: 'Node Js Thang 12',
          tuitionFee: 5000000,
          lecturerIds: [],
          startDate: new Date(),
          daysOfTheWeek: [],
          totalNumberOfLessons: 0,
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

        const courseTest = await courseService.createCourse(
          objectId(),
          accountLecturer.orgId,
          {
            ...createCourseInput,
            startDate: new Date(),
            lecturerIds: [accountLecturer.id],
          },
        )

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

        const createCourseInput: CreateCourseInput = {
          academicSubjectId: objectId(),
          orgOfficeId: objectId(),
          code: 'NodeJS-12',
          name: 'Node Js Thang 12',
          tuitionFee: 5000000,
          lecturerIds: [],
          startDate: new Date(),
          daysOfTheWeek: [],
          totalNumberOfLessons: 0,
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

        const courseTest = await courseService.createCourse(
          objectId(),
          accountLecturer.orgId,
          {
            ...createCourseInput,
            lecturerIds: [accountLecturer.id],
          },
        )

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

        const createCourseInput: CreateCourseInput = {
          academicSubjectId: objectId(),
          orgOfficeId: objectId(),
          code: 'NodeJS-12',
          name: 'Node Js Thang 12',
          tuitionFee: 5000000,
          lecturerIds: [],
          startDate: new Date(),
          daysOfTheWeek: [],
          totalNumberOfLessons: 0,
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

        const courseTest = await courseService.createCourse(
          objectId(),
          accountLecturer.orgId,
          {
            ...createCourseInput,
            lecturerIds: [accountLecturer.id],
          },
        )

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
            dueDate: new Date(),
          },
        )

        const dateUpdated = new Date(updateDate.dueDate).toString()
        const expectDate = new Date(new Date().setHours(7, 0, 0, 0)).toString()
        expect(dateUpdated).toBe(expectDate)
      })

      it(`returns the classworkAssignment with a new dueDate if dueDate of classworkAssignment is null`, async () => {
        expect.assertions(1)

        const createCourseInput: CreateCourseInput = {
          academicSubjectId: objectId(),
          orgOfficeId: objectId(),
          code: 'NodeJS-12',
          name: 'Node Js Thang 12',
          tuitionFee: 5000000,
          lecturerIds: [],
          startDate: new Date(),
          daysOfTheWeek: [],
          totalNumberOfLessons: 0,
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

        const courseTest = await courseService.createCourse(
          objectId(),
          accountLecturer.orgId,
          {
            ...createCourseInput,
            lecturerIds: [accountLecturer.id],
          },
        )

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
            dueDate: new Date(),
          },
        )

        const dateUpdated = new Date(updateDate.dueDate).toString()
        const expectDate = new Date(new Date().setHours(7, 0, 0, 0)).toString()
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
        academicSubject.publication = Publication.Published
        await academicSubject.save()

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
          startDate: new Date(),
          tuitionFee: 5000000,
          lecturerIds: [lecturerAccount.id],
          daysOfTheWeek: [],
          totalNumberOfLessons: 0,
        }

        const course = await courseService.createCourse(
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
          name: 'kmin 2',
          namespace: 'kmin-edu-2',
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
        academicSubject.publication = Publication.Published
        await academicSubject.save()

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
          startDate: new Date(),
          tuitionFee: 5000000,
          lecturerIds: [lecturerAccount.id],
          daysOfTheWeek: [],
          totalNumberOfLessons: 0,
        }

        const course = await courseService.createCourse(
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

        const countClassworkPublic = 2

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
          count: countClassworkPublic,
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

        const createCourseInput: CreateCourseInput = {
          academicSubjectId: objectId(),
          orgOfficeId: objectId(),
          code: 'NodeJS-12',
          name: 'Node Js Thang 12',
          tuitionFee: 5000000,
          lecturerIds: [],
          startDate: new Date(),
          daysOfTheWeek: [],
          totalNumberOfLessons: 0,
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

        const courseTest = await courseService.createCourse(
          objectId(),
          accountLecturer.orgId,
          {
            ...createCourseInput,
            lecturerIds: [accountLecturer.id],
          },
        )

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

        const createCourseInput: CreateCourseInput = {
          academicSubjectId: objectId(),
          orgOfficeId: objectId(),
          code: 'NodeJS-12',
          name: 'Node Js Thang 12',
          tuitionFee: 5000000,
          lecturerIds: [],
          startDate: new Date(),
          daysOfTheWeek: [],
          totalNumberOfLessons: 0,
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

        const courseTest = await courseService.createCourse(
          objectId(),
          org.id,
          {
            ...createCourseInput,
            lecturerIds: [accountLecturer.id],
          },
        )

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
      it(`returns null if Id doesn't exist`, async () => {
        expect.assertions(1)

        await expect(
          classworkService.findClassworkAssignmentById(objectId(), objectId()),
        ).resolves.toBeNull()
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
        academicSubject.publication = Publication.Published
        await academicSubject.save()

        const orgOffice = await orgOfficeService.createOrgOffice({
          name: 'Kmin Quận 1',
          address: '25A',
          createdByAccountId: accountAdmin.id,
          orgId: org.id,
          phone: '0704917152',
        })

        const createCourseInput: CreateCourseInput = {
          academicSubjectId: academicSubject.id,
          orgOfficeId: orgOffice.id,
          code: 'NodeJS-12',
          name: 'Node Js Thang 12',
          tuitionFee: 5000000,
          lecturerIds: [accountLecturer.id],
          startDate: new Date(),
          daysOfTheWeek: [],
          totalNumberOfLessons: 0,
        }

        const courseTest = await courseService.createCourse(
          accountAdmin.id,
          accountLecturer.orgId,
          {
            ...createCourseInput,
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

    describe('calculateAvgGradeOfClassworkAssignment', () => {
      it('throws error if OrgId invalid', async () => {
        expect.assertions(1)

        jest
          .spyOn(classworkService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(false as ANY)

        await expect(
          classworkService.calculateAvgGradeOfClassworkAssignment(
            5,
            objectId(),
            objectId(),
          ),
        ).rejects.toThrowError('ORG_ID_INVALID')
      })

      it('throws error if course not found', async () => {
        expect.assertions(1)

        jest
          .spyOn(classworkService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as ANY)

        await expect(
          classworkService.calculateAvgGradeOfClassworkAssignment(
            5,
            objectId(),
            objectId(),
          ),
        ).rejects.toThrowError('NOT_FOUND_CLASSWORK_ASSIGNMENT_IN_COURSE')
      })

      it('returns average grade', async () => {
        expect.assertions(1)

        const org = await orgService.createOrg({
          namespace: 'kmin-edu',
          name: 'Kmin Academy',
        })

        const accStudent = await accountService.createAccount({
          orgId: org.id,
          email: 'huynhthanhcanhcanh.top@gmail.com',
          password: '123456',
          username: 'thanhthanh',
          roles: ['student'],
          displayName: 'Huynh Thanh Thanh',
        })

        const accStudent2 = await accountService.createAccount({
          orgId: org.id,
          email: 'huynhthanhcanh22.top@gmail.com',
          password: '123456',
          username: 'thanhthanh2',
          roles: ['student'],
          displayName: 'Huynh Thanh Thanh',
        })

        const accLecturer = await accountService.createAccount({
          roles: ['lecturer'],
          email: 'huynhthanhcanh1.top@gmail.com',
          username: 'thanhcanh',
          orgId: org.id,
          displayName: 'Huynh Thanh Canh',
        })

        const accAdmin = await accountService.createAccount({
          roles: ['admin'],
          username: 'thanhcanh123',
          orgId: org.id,
          email: 'huynhthanhcanh3.top@gmail.com',
          displayName: 'Huynh Thanh Canh Thanh',
        })

        const academicSubject = await academicService.createAcademicSubject({
          orgId: org.id,
          code: 'NODEJS',
          name: 'NodeJS',
          description: 'This is NodeJs',
          createdByAccountId: accAdmin.id,
          imageFileId: objectId(),
        })
        academicSubject.publication = Publication.Published
        await academicSubject.save()

        const orgOffice = await orgOfficeService.createOrgOffice({
          name: 'Kmin Quận 1',
          address: '25A',
          createdByAccountId: accAdmin.id,
          orgId: org.id,
          phone: '0704917152',
        })

        const createCourseInput: CreateCourseInput = {
          academicSubjectId: academicSubject.id,
          orgOfficeId: orgOffice.id,
          code: 'NodeJS-12',
          name: 'Node Js Thang 12',
          tuitionFee: 5000000,
          lecturerIds: [accLecturer.id],
          startDate: new Date(),
          daysOfTheWeek: [],
          totalNumberOfLessons: 0,
        }

        const course = await courseService.createCourse(accAdmin.id, org.id, {
          ...createCourseInput,
          lecturerIds: [accLecturer.id],
        })

        course.studentIds = [accStudent.id, accStudent2.id]
        course.save()

        const classwork1 = await classworkService.createClassworkAssignment(
          accLecturer.id,
          course.id,
          org.id,
          {
            title: 'Bai tap 1',
            description: 'Day la bai tap 1',
          },
        )

        await classworkService.createClassworkAssignment(
          accLecturer.id,
          course.id,
          org.id,
          {
            title: 'Bai tap 2',
            description: 'Day la bai tap 2',
          },
        )

        await classworkService.createClassworkAssignment(
          accLecturer.id,
          course.id,
          org.id,
          {
            title: 'Bai tap 3',
            description: 'Day la bai tap 3',
          },
        )

        const createInputWithFile: ANY = {
          classworkId: classwork1.id,
        }

        const classWorkSubmission1 =
          await classworkService.createClassworkSubmission(
            org.id,
            course.id,
            accStudent.id,
            createInputWithFile,
          )

        classWorkSubmission1.grade = 60
        classWorkSubmission1.save()

        const classWorkSubmission2 =
          await classworkService.createClassworkSubmission(
            org.id,
            course.id,
            accStudent2.id,
            createInputWithFile,
          )

        classWorkSubmission2.grade = 50
        classWorkSubmission2.save()

        await expect(
          classworkService.calculateAvgGradeOfClassworkAssignment(
            course.studentIds.length,
            classwork1.id,
            org.id,
          ),
        ).resolves.toEqual(55)
      })
    })

    describe('listClassworkAssignmentsByStudentIdInCourse', () => {
      const orgId = objectId()
      const accountId = objectId()
      const courseId = objectId()
      const listMockData: ANY = [
        {
          _id: '61164cf33a0c162ba0f37144',
          type: 'Assignment',
          publicationState: 'Published',
          dueDate: null,
          createdByAccountId: '60a33d548eb0d63a68e83885',
          courseId: '609d307054235016f18ca955',
          orgId: '609d2ffc54235016f18ca94f',
          title: 'db123w',
          description: ' ajkbd123',
          ClassworkSubmissions: [
            {
              _id: '61164d113a0c162ba0f37150',
              grade: 0,
              description: '1321231231235',
              createdByAccountId: '60a33db98eb0d63a68e83886',
              classworkId: '61164cf33a0c162ba0f37144',
              courseId: '609d307054235016f18ca955',
              orgId: '609d2ffc54235016f18ca94f',
              updatedAt: '1-1-2021',
            },
          ],
        },
        {
          _id: objectId(),
          type: 'Assignment',
          publicationState: 'Published',
          dueDate: '2-1-2021',
          courseId,
          orgId,
          title: 'dbw',
          ClassworkSubmissions: [
            {
              _id: objectId(),
              grade: 100,
              description: '123sdg',
              createdByAccountId: accountId,
              courseId,
              orgId,
              updatedAt: '1-1-2021',
            },
          ],
        },
        {
          _id: objectId(),
          title: 'new3112312',
          type: 'Assignment',
          publicationState: 'Published',
          dueDate: null,
          courseId,
          orgId,
          ClassworkSubmissions: [],
        },
        {
          _id: objectId(),
          title: 'Bài tập 2',
          type: 'Assignment',
          publicationState: 'Published',
          description: null,
          courseId,
          orgId,
          ClassworkSubmissions: [],
        },
        {
          _id: objectId(),
          title: 'Bài tập 1',
          type: 'Assignment',
          publicationState: 'Published',
          description: null,
          courseId,
          orgId,
          ClassworkSubmissions: [
            {
              _id: objectId(),
              grade: 80,
              description: '1sdaj',
              createdByAccountId: accountId,
              courseId,
              orgId,
              updatedAt: '1-1-2021',
            },
          ],
        },
      ]

      it('returns a ClassworkAssignmentByStudentIdInCourseResponsePayload if found status All', async () => {
        expect.assertions(2)

        jest
          .spyOn(classworkService['classworkAssignmentsModel'], 'aggregate')
          .mockResolvedValueOnce(listMockData as ANY)
        jest
          .spyOn(classworkService['classworkAssignmentsModel'], 'aggregate')
          .mockResolvedValueOnce(listMockData as ANY)

        const res: ClassworkAssignmentByStudentIdInCourseResponsePayload =
          new ClassworkAssignmentByStudentIdInCourseResponsePayload()

        res.count = 5
        res.list = await listMockData.map(
          (el): ClassworkAssignmentByStudentIdInCourseResponse => {
            const classworkAssignmentByStudent: ClassworkAssignmentByStudentIdInCourseResponse =
              new ClassworkAssignmentByStudentIdInCourseResponse()

            // eslint-disable-next-line no-underscore-dangle
            classworkAssignmentByStudent.classworkAssignmentId = el._id
            classworkAssignmentByStudent.classworkAssignmentsTitle = el.title
            classworkAssignmentByStudent.dueDate = el.dueDate
            if (el.ClassworkSubmissions.length !== 0) {
              classworkAssignmentByStudent.classworkSubmissionGrade =
                el.ClassworkSubmissions[0].grade
              classworkAssignmentByStudent.classworkSubmissionUpdatedAt =
                el.ClassworkSubmissions[0].updatedAt
              classworkAssignmentByStudent.classworkSubmissionDescription =
                el.ClassworkSubmissions[0].description
            }
            return classworkAssignmentByStudent
          },
        )

        await expect(
          classworkService.listClassworkAssignmentsByStudentIdInCourse(
            {
              courseId,
              limit: 5,
              status: ClassworkAssignmentByStudentIdInCourseInputStatus.All,
            } as ClassworkAssignmentByStudentIdInCourseInput,
            orgId,
            accountId,
          ),
        ).resolves.toMatchObject(res)

        res.list = res.list.slice(2, 5)

        await expect(
          classworkService.listClassworkAssignmentsByStudentIdInCourse(
            {
              courseId,
              limit: 5,
              skip: 2,
              status: ClassworkAssignmentByStudentIdInCourseInputStatus.All,
            } as ClassworkAssignmentByStudentIdInCourseInput,
            orgId,
            accountId,
          ),
        ).resolves.toMatchObject(res)
      })

      it('returns a ClassworkAssignmentByStudentIdInCourseResponsePayload if found status HaveSubmission', async () => {
        expect.assertions(2)

        jest
          .spyOn(classworkService['classworkAssignmentsModel'], 'aggregate')
          .mockResolvedValueOnce(listMockData as ANY)
        jest
          .spyOn(classworkService['classworkAssignmentsModel'], 'aggregate')
          .mockResolvedValueOnce(listMockData as ANY)

        const res: ClassworkAssignmentByStudentIdInCourseResponsePayload =
          new ClassworkAssignmentByStudentIdInCourseResponsePayload()

        res.count = 3
        res.list = await listMockData.map(
          (el): ClassworkAssignmentByStudentIdInCourseResponse => {
            const classworkAssignmentByStudent: ClassworkAssignmentByStudentIdInCourseResponse =
              new ClassworkAssignmentByStudentIdInCourseResponse()

            // eslint-disable-next-line no-underscore-dangle
            classworkAssignmentByStudent.classworkAssignmentId = el._id
            classworkAssignmentByStudent.classworkAssignmentsTitle = el.title
            classworkAssignmentByStudent.dueDate = el.dueDate
            if (el.ClassworkSubmissions.length !== 0) {
              classworkAssignmentByStudent.classworkSubmissionGrade =
                el.ClassworkSubmissions[0].grade
              classworkAssignmentByStudent.classworkSubmissionUpdatedAt =
                el.ClassworkSubmissions[0].updatedAt
              classworkAssignmentByStudent.classworkSubmissionDescription =
                el.ClassworkSubmissions[0].description
            }
            return classworkAssignmentByStudent
          },
        )

        res.list = res.list.filter((el): boolean => {
          return !!el.classworkSubmissionUpdatedAt
        })

        await expect(
          classworkService.listClassworkAssignmentsByStudentIdInCourse(
            {
              courseId,
              limit: 5,
              status:
                ClassworkAssignmentByStudentIdInCourseInputStatus.HaveSubmission,
            } as ClassworkAssignmentByStudentIdInCourseInput,
            orgId,
            accountId,
          ),
        ).resolves.toMatchObject(res)

        res.list = res.list.slice(2, 5)

        await expect(
          classworkService.listClassworkAssignmentsByStudentIdInCourse(
            {
              courseId,
              limit: 5,
              skip: 2,
              status:
                ClassworkAssignmentByStudentIdInCourseInputStatus.HaveSubmission,
            } as ClassworkAssignmentByStudentIdInCourseInput,
            orgId,
            accountId,
          ),
        ).resolves.toMatchObject(res)
      })

      it('returns a ClassworkAssignmentByStudentIdInCourseResponsePayload if found status HaveNotSubmission', async () => {
        expect.assertions(2)

        jest
          .spyOn(classworkService['classworkAssignmentsModel'], 'aggregate')
          .mockResolvedValueOnce(listMockData as ANY)
        jest
          .spyOn(classworkService['classworkAssignmentsModel'], 'aggregate')
          .mockResolvedValueOnce(listMockData as ANY)

        const res: ClassworkAssignmentByStudentIdInCourseResponsePayload =
          new ClassworkAssignmentByStudentIdInCourseResponsePayload()

        res.count = 2
        res.list = await listMockData.map(
          (el): ClassworkAssignmentByStudentIdInCourseResponse => {
            const classworkAssignmentByStudent: ClassworkAssignmentByStudentIdInCourseResponse =
              new ClassworkAssignmentByStudentIdInCourseResponse()

            // eslint-disable-next-line no-underscore-dangle
            classworkAssignmentByStudent.classworkAssignmentId = el._id
            classworkAssignmentByStudent.classworkAssignmentsTitle = el.title
            classworkAssignmentByStudent.dueDate = el.dueDate
            if (el.ClassworkSubmissions.length !== 0) {
              classworkAssignmentByStudent.classworkSubmissionGrade =
                el.ClassworkSubmissions[0].grade
              classworkAssignmentByStudent.classworkSubmissionUpdatedAt =
                el.ClassworkSubmissions[0].updatedAt
              classworkAssignmentByStudent.classworkSubmissionDescription =
                el.ClassworkSubmissions[0].description
            }
            return classworkAssignmentByStudent
          },
        )

        res.list = res.list.filter((el): boolean => {
          return !el.classworkSubmissionUpdatedAt
        })

        await expect(
          classworkService.listClassworkAssignmentsByStudentIdInCourse(
            {
              courseId,
              limit: 5,
              status:
                ClassworkAssignmentByStudentIdInCourseInputStatus.HaveNotSubmission,
            } as ClassworkAssignmentByStudentIdInCourseInput,
            orgId,
            accountId,
          ),
        ).resolves.toMatchObject(res)

        res.list = res.list.slice(2, 5)

        await expect(
          classworkService.listClassworkAssignmentsByStudentIdInCourse(
            {
              courseId,
              limit: 5,
              skip: 2,
              status:
                ClassworkAssignmentByStudentIdInCourseInputStatus.HaveNotSubmission,
            } as ClassworkAssignmentByStudentIdInCourseInput,
            orgId,
            accountId,
          ),
        ).resolves.toMatchObject(res)
      })

      it('returns a ClassworkAssignmentByStudentIdInCourseResponsePayload with empty list and count zero if not found', async () => {
        expect.assertions(1)

        jest
          .spyOn(classworkService['classworkAssignmentsModel'], 'aggregate')
          .mockResolvedValueOnce([] as ANY)

        await expect(
          classworkService.listClassworkAssignmentsByStudentIdInCourse(
            {
              courseId: objectId(),
              limit: 3,
              status: ClassworkAssignmentByStudentIdInCourseInputStatus.All,
            } as ClassworkAssignmentByStudentIdInCourseInput,
            objectId(),
            objectId(),
          ),
        ).resolves.toMatchObject({ count: 0, list: [] })
      })
    })

    describe('cloneClassworkAssignmentFromClassworkAssignmentId', () => {
      it(`throws error if from classwork assignment not found`, async () => {
        expect.assertions(1)
        await expect(
          classworkService.cloneClassworkAssignmentFromClassworkAssignmentId(
            objectId(),
            objectId(),
            objectId(),
            objectId(),
          ),
        ).rejects.toThrowError(`FORMCLASSWORKASSIGNMENT_NOT_FOUND`)
      })

      it(`throws error if to course not found`, async () => {
        expect.assertions(1)
        jest
          .spyOn(classworkService, 'findClassworkAssignmentById')
          .mockResolvedValueOnce({ id: objectId() } as ANY)

        await expect(
          classworkService.cloneClassworkAssignmentFromClassworkAssignmentId(
            objectId(),
            objectId(),
            objectId(),
            objectId(),
          ),
        ).rejects.toThrowError(`TOCOURSE_NOT_FOUND`)
      })

      it(`throws error if account can't manage course`, async () => {
        expect.assertions(1)
        jest
          .spyOn(classworkService, 'findClassworkAssignmentById')
          .mockResolvedValueOnce({ id: objectId() } as ANY)
        jest
          .spyOn(courseService, 'findCourseById')
          .mockResolvedValueOnce({ id: objectId() } as ANY)
        await expect(
          classworkService.cloneClassworkAssignmentFromClassworkAssignmentId(
            objectId(),
            objectId(),
            objectId(),
            objectId(),
          ),
        ).rejects.toThrowError(`ACCOUNT_CAN'T_MANAGE_COURSE`)
      })

      it(`returns new clone ClassworkAssignment`, async () => {
        expect.assertions(1)
        const classwork = {
          id: objectId(),
          title: 'classwork 1',
          description: 'description classwork 1',
          publicationState: Publication.Draft,
          attachments: [objectId(), objectId()],
        }
        jest
          .spyOn(classworkService, 'findClassworkAssignmentById')
          .mockResolvedValueOnce(classwork as ANY)
        jest
          .spyOn(courseService, 'findCourseById')
          .mockResolvedValueOnce({ id: objectId() } as ANY)
        jest
          .spyOn(authService, 'canAccountManageCourse')
          .mockResolvedValueOnce(true as never)
        jest
          .spyOn(classworkService, 'createClassworkAssignment')
          .mockResolvedValueOnce(classwork as ANY)
        jest
          .spyOn(
            classworkService['classworkAssignmentsModel'],
            'findByIdAndUpdate',
          )
          .mockResolvedValueOnce(classwork as ANY)

        await expect(
          classworkService.cloneClassworkAssignmentFromClassworkAssignmentId(
            objectId(),
            objectId(),
            objectId(),
            objectId(),
          ),
        ).resolves.toMatchObject(classwork)
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
    beforeEach(async () => {
      await mongooseConnection.dropDatabase()
      jest.resetAllMocks()
      jest.restoreAllMocks()
    })

    describe('CreateClassWorkSubmission', () => {
      const createClassWorkSubmissionInput: CreateClassworkSubmissionInput = {
        classworkId: objectId(),
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
            objectId(),
            createClassWorkSubmissionInput,
          ),
        ).rejects.toThrowError('ORG_ID_INVALID')

        await expect(
          classworkService.createClassworkSubmission(
            'objectId()',
            objectId(),
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
            objectId(),
            createClassWorkSubmissionInput,
          ),
        ).rejects.toThrowError(`ACCOUNT_ISN'T_A_STUDENT_FORM_COURSE`)

        await expect(
          classworkService.createClassworkSubmission(
            objectId(),
            'objectId()',
            objectId(),
            createClassWorkSubmissionInput,
          ),
        ).rejects.toThrowError(`ACCOUNT_ISN'T_A_STUDENT_FORM_COURSE`)
      })

      it(`throws error if student submitted`, async () => {
        expect.assertions(1)

        jest
          .spyOn(classworkService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as ANY)

        jest
          .spyOn(classworkService['authService'], 'isAccountStudentFormCourse')
          .mockResolvedValueOnce(true as ANY)

        jest
          .spyOn(classworkService['classworkSubmissionModel'], 'findOne')
          .mockResolvedValueOnce({ name: `not null` } as ANY)

        await expect(
          classworkService.createClassworkSubmission(
            objectId(),
            objectId(),
            objectId(),
            createClassWorkSubmissionInput,
          ),
        ).rejects.toThrowError(`STUDENT_SUBMITTED_ASSIGNMENTS`)
      })

      it(`returns the created classworkSubmission haven't files`, async () => {
        expect.assertions(2)

        jest
          .spyOn(classworkService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as never)

        jest
          .spyOn(classworkService['authService'], 'isAccountStudentFormCourse')
          .mockResolvedValueOnce(true as ANY)

        const createdByAccountId = objectId()

        const classWorkSubmission =
          await classworkService.createClassworkSubmission(
            objectId(),
            objectId(),
            createdByAccountId,
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
              submission.createdByAccountId.toString() === createdByAccountId
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
            {
              submissionId: objectId(),
              grade: 70,
            },
          ),
        ).rejects.toThrowError('ORG_ID_INVALID')
      })

      it('throws error if the account is not a course lecturer', async () => {
        expect.assertions(1)

        const orgId = objectId()
        const courseId = objectId()
        const gradeByAccountId = objectId()

        const classworkAssignment: ANY = {
          id: objectId(),
          courseId,
          title: 'Thi HK1',
        }

        const classworkSubmissionInput: ANY = {
          classworkId: classworkAssignment.id,
        }

        jest
          .spyOn(classworkService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as ANY)
          .mockResolvedValueOnce(true as ANY)
        jest
          .spyOn(classworkService['authService'], 'isAccountStudentFormCourse')
          .mockResolvedValueOnce(true as ANY)

        const classworkSubmission =
          await classworkService.createClassworkSubmission(
            orgId,
            courseId,
            gradeByAccountId,
            classworkSubmissionInput,
          )

        jest
          .spyOn(classworkService['classworkSubmissionModel'], 'findById')
          .mockResolvedValueOnce(classworkSubmission)
        jest
          .spyOn(classworkService['classworkAssignmentsModel'], 'findById')
          .mockResolvedValueOnce(classworkAssignment)

        await expect(
          classworkService.setGradeForClassworkSubmission(
            objectId(),
            objectId(),
            {
              submissionId: classworkSubmission.id,
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
            {
              submissionId: objectId(),
              grade: 70,
            },
          ),
        ).rejects.toThrowError(`CLASSWORK_SUBMISSION_NOT_FOUND`)
      })

      it('throws error if classwork not found', async () => {
        expect.assertions(1)

        jest
          .spyOn(classworkService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as ANY)
        jest
          .spyOn(classworkService['authService'], 'canAccountManageCourse')
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

        await expect(
          classworkService.setGradeForClassworkSubmission(
            objectId(),
            objectId(),
            {
              submissionId: objectId(),
              grade: -1,
            },
          ),
        ).rejects.toThrowError(`CLASSWORK_NOT_FOUND`)
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

        const courseId = objectId()

        const classworkAssignment: ANY = {
          id: objectId(),
          courseId,
          title: 'Thi HK1',
        }

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
        jest
          .spyOn(classworkService['classworkAssignmentsModel'], 'findById')
          .mockResolvedValueOnce(classworkAssignment)
          .mockResolvedValueOnce(classworkAssignment)

        await expect(
          classworkService.setGradeForClassworkSubmission(
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
        }

        const classworkAssignment: ANY = {
          id: objectId(),
          courseId,
          title: 'Thi HK1',
        }

        jest
          .spyOn(classworkService['authService'], 'isAccountStudentFormCourse')
          .mockResolvedValueOnce(true as ANY)

        const classworkSubmission =
          await classworkService.createClassworkSubmission(
            orgId,
            courseId,
            gradeByAccountId,
            classworkSubmissionInput,
          )

        jest
          .spyOn(classworkService['classworkSubmissionModel'], 'findById')
          .mockResolvedValueOnce(classworkSubmission)
          .mockResolvedValueOnce(classworkSubmission)
        jest
          .spyOn(classworkService['classworkAssignmentsModel'], 'findById')
          .mockResolvedValueOnce(classworkAssignment)
          .mockResolvedValueOnce(classworkAssignment)

        await expect(
          classworkService.setGradeForClassworkSubmission(
            orgId,
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

    describe('listClassworkSubmissionsByClassworkAssignmentId', () => {
      it('throws error if ClassworkSubmission not found', async () => {
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

    describe('findClassworkSubmissionById', () => {
      it('returns a ClassworkSubmission it found', async () => {
        expect.assertions(1)

        const classworkSubmission = {
          createdAt: '2021-06-06T10:51:12.280Z',
          updatedAt: '2021-06-06T10:51:12.280Z',
          description: 'Description',
          grade: 0,
        }

        jest
          .spyOn(classworkService['classworkSubmissionModel'], 'findOne')
          .mockResolvedValueOnce(classworkSubmission as ANY)

        await expect(
          classworkService.findClassworkSubmissionById(objectId(), objectId()),
        ).resolves.toMatchObject(classworkSubmission)
      })
      it('returns a null it not found', async () => {
        expect.assertions(1)

        jest
          .spyOn(classworkService['classworkSubmissionModel'], 'findOne')
          .mockResolvedValueOnce(null)

        await expect(
          classworkService.findClassworkSubmissionById(objectId(), objectId()),
        ).resolves.toBeNull()
      })
    })

    describe('findOneClassworkSubmission', () => {
      it('returns a ClassworkSubmission if found', async () => {
        expect.assertions(1)

        jest
          .spyOn(classworkService['classworkSubmissionModel'], 'findOne')
          .mockResolvedValueOnce({ name: 'not null' } as ANY)

        await expect(
          classworkService.findOneClassworkSubmission(
            objectId(),
            objectId(),
            objectId(),
          ),
        ).resolves.toMatchObject({ name: 'not null' })
      })

      it('returns null if not found', async () => {
        expect.assertions(1)

        jest
          .spyOn(classworkService['classworkSubmissionModel'], 'findOne')
          .mockResolvedValueOnce(null)

        await expect(
          classworkService.findOneClassworkSubmission(
            objectId(),
            objectId(),
            objectId(),
          ),
        ).resolves.toBeNull()
      })
    })

    describe('getListOfStudentsSubmitAssignmentsByStatus', () => {
      it('throws error if classworkAssignment is not found', async () => {
        expect.assertions(1)

        await expect(
          classworkService.getListOfStudentsSubmitAssignmentsByStatus(
            objectId(),
            ClassworkSubmissionStatus.OnTime,
          ),
        ).rejects.toThrowError('CLASSWORK_ASSIGNMENT_NOT_FOUND')
      })

      it('throws error if course is not found', async () => {
        expect.assertions(1)

        const org = await orgService.createOrg({
          namespace: 'kmin-edu',
          name: 'Kmin Academy',
        })

        const accLecturer = await accountService.createAccount({
          roles: ['lecturer'],
          email: 'huynhthanhcanh1.top@gmail.com',
          username: 'thanhcanh',
          orgId: org.id,
          displayName: 'Huynh Thanh Canh',
        })

        jest
          .spyOn(authService, 'canAccountManageCourse')
          .mockResolvedValueOnce(true)

        const classworkAssignment =
          await classworkService.createClassworkAssignment(
            accLecturer.id,
            objectId(),
            org.id,
            {
              title: 'Bai tap 1',
              description: 'Day la bai tap 2',
            },
          )

        await expect(
          classworkService.getListOfStudentsSubmitAssignmentsByStatus(
            classworkAssignment.id,
            ClassworkSubmissionStatus.OnTime,
          ),
        ).rejects.toThrowError('COURSE_NOT_FOUND')
      })

      it('returns a list of classworkSubmissions and counts by status', async () => {
        expect.assertions(4)

        const org = await orgService.createOrg({
          namespace: 'kmin-edu',
          name: 'Kmin Academy',
        })

        const accStudent1 = await accountService.createAccount({
          orgId: org.id,
          email: 'huynhthanhcanhcanh.top@gmail.com',
          password: '123456',
          username: 'thanhthanh',
          roles: ['student'],
          displayName: 'Huynh Thanh Thanh',
        })

        const accStudent2 = await accountService.createAccount({
          orgId: org.id,
          email: 'huynhthanhcanh22.top@gmail.com',
          password: '123456',
          username: 'thanhthanh2',
          roles: ['student'],
          displayName: 'Huynh Thanh Thanh',
        })

        const accStudent3 = await accountService.createAccount({
          orgId: org.id,
          email: 'huynhthanhcanh222.top@gmail.com',
          password: '123456',
          username: 'thanhthanh22',
          roles: ['student'],
          displayName: 'Huynh Thanh Thanh',
        })

        const accLecturer = await accountService.createAccount({
          roles: ['lecturer'],
          email: 'huynhthanhcanh1.top@gmail.com',
          username: 'thanhcanh',
          orgId: org.id,
          displayName: 'Huynh Thanh Canh',
        })

        const accAdmin = await accountService.createAccount({
          roles: ['admin'],
          username: 'thanhcanh123',
          orgId: org.id,
          email: 'huynhthanhcanh3.top@gmail.com',
          displayName: 'Huynh Thanh Canh Thanh',
        })

        const academicSubject = await academicService.createAcademicSubject({
          orgId: org.id,
          code: 'NODEJS',
          name: 'NodeJS',
          description: 'This is NodeJs',
          createdByAccountId: accAdmin.id,
          imageFileId: objectId(),
        })
        academicSubject.publication = Publication.Published
        await academicSubject.save()

        const orgOffice = await orgOfficeService.createOrgOffice({
          name: 'Kmin Quận 1',
          address: '25A',
          createdByAccountId: accAdmin.id,
          orgId: org.id,
          phone: '0704917152',
        })

        const createCourseInput: CreateCourseInput = {
          academicSubjectId: academicSubject.id,
          orgOfficeId: orgOffice.id,
          code: 'NodeJS-12',
          name: 'Node Js Thang 12',
          tuitionFee: 5000000,
          lecturerIds: [accLecturer.id],
          startDate: new Date(),
          daysOfTheWeek: [],
          totalNumberOfLessons: 0,
        }

        const course = await courseService.createCourse(accAdmin.id, org.id, {
          ...createCourseInput,
          lecturerIds: [accLecturer.id],
        })

        course.studentIds = [accStudent1.id, accStudent2.id, accStudent3.id]
        course.save()

        const classwork = await classworkService.createClassworkAssignment(
          accLecturer.id,
          course.id,
          org.id,
          {
            title: 'Bai tap 1',
            description: 'Day la bai tap 1',
            dueDate: new Date(),
          },
        )

        const date = new Date()
        const updated = new Date()
        const updated1 = new Date()

        const classworkSubmissionData: ANY = [
          {
            createdByAccountId: accStudent1.id,
            description: 'classworkSubmission_1',
            classworkId: classwork.id,
            courseId: course.id,
            orgId: org.id,
            updatedAt: new Date(updated.setDate(date.getDate() - 3)),
          },
          {
            createdByAccountId: accStudent2.id,
            description: 'classworkSubmission_2',
            classworkId: classwork.id,
            courseId: course.id,
            orgId: org.id,
            updatedAt: new Date(updated1.setDate(date.getDate() + 3)),
          },
        ]

        jest
          .spyOn(classworkService['classworkSubmissionModel'], 'find')
          .mockResolvedValueOnce(classworkSubmissionData)
          .mockResolvedValueOnce(classworkSubmissionData)
          .mockResolvedValueOnce(classworkSubmissionData)
          .mockResolvedValueOnce(classworkSubmissionData)

        await expect(
          classworkService.getListOfStudentsSubmitAssignmentsByStatus(
            classwork.id,
            ClassworkSubmissionStatus.Submitted,
          ),
        ).resolves.toMatchObject({
          classworkSubmissions: [
            classworkSubmissionData[0],
            classworkSubmissionData[1],
          ],
          count: 2,
        })

        await expect(
          classworkService.getListOfStudentsSubmitAssignmentsByStatus(
            classwork.id,
            ClassworkSubmissionStatus.OnTime,
          ),
        ).resolves.toMatchObject({
          classworkSubmissions: [classworkSubmissionData[0]],
          count: 1,
        })

        await expect(
          classworkService.getListOfStudentsSubmitAssignmentsByStatus(
            classwork.id,
            ClassworkSubmissionStatus.Late,
          ),
        ).resolves.toMatchObject({
          classworkSubmissions: [classworkSubmissionData[1]],
          count: 1,
        })

        await expect(
          classworkService.getListOfStudentsSubmitAssignmentsByStatus(
            classwork.id,
            ClassworkSubmissionStatus.DoNotSubmit,
          ),
        ).resolves.toMatchObject({
          classworkSubmissions: [],
          count: 1,
        })
      })
    })

    describe('submissionStatusStatistics', () => {
      it('returns list of status and counts', async () => {
        expect.assertions(1)

        const org = await orgService.createOrg({
          namespace: 'kmin-edu',
          name: 'Kmin Academy',
        })

        const accStudent1 = await accountService.createAccount({
          orgId: org.id,
          email: 'huynhthanhcanhcanh.top@gmail.com',
          password: '123456',
          username: 'thanhthanh',
          roles: ['student'],
          displayName: 'Huynh Thanh Thanh',
        })

        const accStudent2 = await accountService.createAccount({
          orgId: org.id,
          email: 'huynhthanhcanh22.top@gmail.com',
          password: '123456',
          username: 'thanhthanh2',
          roles: ['student'],
          displayName: 'Huynh Thanh Thanh',
        })

        const accStudent3 = await accountService.createAccount({
          orgId: org.id,
          email: 'huynhthanhcanh222.top@gmail.com',
          password: '123456',
          username: 'thanhthanh22',
          roles: ['student'],
          displayName: 'Huynh Thanh Thanh',
        })

        const accLecturer = await accountService.createAccount({
          roles: ['lecturer'],
          email: 'huynhthanhcanh1.top@gmail.com',
          username: 'thanhcanh',
          orgId: org.id,
          displayName: 'Huynh Thanh Canh',
        })

        const accAdmin = await accountService.createAccount({
          roles: ['admin'],
          username: 'thanhcanh123',
          orgId: org.id,
          email: 'huynhthanhcanh3.top@gmail.com',
          displayName: 'Huynh Thanh Canh Thanh',
        })

        const academicSubject = await academicService.createAcademicSubject({
          orgId: org.id,
          code: 'NODEJS',
          name: 'NodeJS',
          description: 'This is NodeJs',
          createdByAccountId: accAdmin.id,
          imageFileId: objectId(),
        })
        academicSubject.publication = Publication.Published
        await academicSubject.save()

        const orgOffice = await orgOfficeService.createOrgOffice({
          name: 'Kmin Quận 1',
          address: '25A',
          createdByAccountId: accAdmin.id,
          orgId: org.id,
          phone: '0704917152',
        })

        const createCourseInput: CreateCourseInput = {
          academicSubjectId: academicSubject.id,
          orgOfficeId: orgOffice.id,
          code: 'NodeJS-12',
          name: 'Node Js Thang 12',
          tuitionFee: 5000000,
          lecturerIds: [accLecturer.id],
          startDate: new Date(),
          daysOfTheWeek: [],
          totalNumberOfLessons: 0,
        }

        const course = await courseService.createCourse(accAdmin.id, org.id, {
          ...createCourseInput,
          lecturerIds: [accLecturer.id],
        })

        course.studentIds = [accStudent1.id, accStudent2.id, accStudent3.id]
        course.save()

        const classwork = await classworkService.createClassworkAssignment(
          accLecturer.id,
          course.id,
          org.id,
          {
            title: 'Bai tap 1',
            description: 'Day la bai tap 1',
            dueDate: new Date(),
          },
        )

        const date = new Date()
        const updated = new Date()
        const updated1 = new Date()

        const classworkSubmissionData: ANY = [
          {
            createdByAccountId: accStudent1.id,
            description: 'classworkSubmission_1',
            classworkId: classwork.id,
            courseId: course.id,
            orgId: org.id,
            updatedAt: new Date(updated.setDate(date.getDate() - 3)),
          },
          {
            createdByAccountId: accStudent2.id,
            description: 'classworkSubmission_2',
            classworkId: classwork.id,
            courseId: course.id,
            orgId: org.id,
            updatedAt: new Date(updated1.setDate(date.getDate() + 3)),
          },
        ]

        jest
          .spyOn(classworkService['classworkSubmissionModel'], 'find')
          .mockResolvedValueOnce(classworkSubmissionData)
          .mockResolvedValueOnce(classworkSubmissionData)
          .mockResolvedValueOnce(classworkSubmissionData)

        await expect(
          classworkService.submissionStatusStatistics(classwork.id),
        ).resolves.toMatchObject([
          {
            label: 'On Time',
            number: 1,
          },
          {
            label: 'Late',
            number: 1,
          },
          {
            label: 'Do not submit',
            number: 1,
          },
        ])
      })
    })
  })

  /**
   * END CLASSWORK SUBMISSION
   */
})
