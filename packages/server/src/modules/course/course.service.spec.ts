import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { Publication } from 'core'
import { objectId } from 'core/utils/db'
import { createTestingModule, initTestDb } from 'core/utils/testing'
import { AcademicService } from 'modules/academic/academic.service'
import { AccountService } from 'modules/account/account.service'
import { AccountStatus } from 'modules/account/models/Account'
import { AuthService } from 'modules/auth/auth.service'
import { ClassworkService } from 'modules/classwork/classwork.service'
import { AvgGradeOfClassworkByCourseOptionInput } from 'modules/classwork/classwork.type'
import { OrgService } from 'modules/org/org.service'
import { OrgOfficeService } from 'modules/orgOffice/orgOffice.service'
import { ANY } from 'types'

import { CourseService } from './course.service'
import { CreateCourseInput } from './course.type'

describe('course.service', () => {
  let module: TestingModule
  let academicService: AcademicService
  let orgService: OrgService
  let authService: AuthService
  let accountService: AccountService
  let courseService: CourseService
  let orgOfficeService: OrgOfficeService
  let classworkService: ClassworkService
  let mongooseConnection: Connection

  beforeAll(async () => {
    const testDb = await initTestDb()
    mongooseConnection = testDb.mongooseConnection

    module = await createTestingModule(testDb.uri)

    academicService = module.get<AcademicService>(AcademicService)
    courseService = module.get<CourseService>(CourseService)
    orgService = module.get<OrgService>(OrgService)
    authService = module.get<AuthService>(AuthService)
    accountService = module.get<AccountService>(AccountService)
    orgOfficeService = module.get<OrgOfficeService>(OrgOfficeService)
    classworkService = module.get<ClassworkService>(ClassworkService)
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
    expect(courseService).toBeDefined()
  })

  const createCourseInput: ANY = {
    academicSubjectId: objectId(),
    orgOfficeId: objectId(),
    code: 'NodeJS-12',
    name: 'Node Js Thang 12',
    tuitionFee: 5000000,
    lecturerIds: [],
  }
  describe('createCourse', () => {
    it(`throws error "Org ID is invalid" if org id is invalid`, async () => {
      expect.assertions(1)

      await expect(
        courseService.createCourse(objectId(), objectId(), {
          ...createCourseInput,
          startDate: '1618765200000',
        }),
      ).rejects.toThrowError('Org ID is invalid')
    })

    it(`throws error "ACCOUNT_HAS_NOT_PERMISSION" if account has not permission`, async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      await expect(
        courseService.createCourse(objectId(), objectId(), {
          ...createCourseInput,
          startDate: '1618765200000',
        }),
      ).rejects.toThrowError('ACCOUNT_HAS_NOT_PERMISSION')
    })

    it(`throws error "ACADEMIC_SUBJECT_NOT_FOUND" if academic subject not found`, async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)

      await expect(
        courseService.createCourse(objectId(), objectId(), {
          ...createCourseInput,
          startDate: '1618765200000',
        }),
      ).rejects.toThrowError('ACADEMIC_SUBJECT_NOT_FOUND')
    })

    it(`throws error "START_DATE_INVALID" if the entered date less than the current date`, async () => {
      expect.assertions(1)

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

      const date = new Date()
      // Start date less than the current date
      await expect(
        courseService.createCourse(objectId(), objectId(), {
          ...createCourseInput,
          startDate: date.setDate(date.getDate() - 1),
        }),
      ).rejects.toThrowError('START_DATE_INVALID')
    })

    it(`throws error if the lecturerIds array containing lecturerId does not exist or is not a lecturer`, async () => {
      expect.assertions(2)

      const org = await orgService.createOrg({
        namespace: 'kmin-edu',
        name: 'Kmin Academy',
      })

      const accountAdmin = await accountService.createAccount({
        orgId: org.id,
        email: 'huynhthanhcanhadmin.top@gmail.com',
        password: '123456',
        username: 'thanhcanhadmin',
        roles: ['admin'],
        displayName: 'Thanh Canh Admin',
      })

      const id = objectId()
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

      await expect(
        courseService.createCourse(objectId(), org.id, {
          ...createCourseInput,
          startDate: Date.now(),
          lecturerIds: [id],
        }),
      ).rejects.toThrowError(`ID ${id} is not found`)

      await expect(
        courseService.createCourse(objectId(), org.id, {
          ...createCourseInput,
          startDate: Date.now(),
          lecturerIds: [accountAdmin.id],
        }),
      ).rejects.toThrowError(`Thanh Canh Admin isn't a lecturer`)
    })

    it(`returns a course`, async () => {
      expect.assertions(1)

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

      const creatorId = objectId()
      const orgId = objectId()

      await expect(
        courseService.createCourse(creatorId, orgId, {
          ...createCourseInput,
          startDate: Date.now(),
        }),
      ).resolves.toMatchObject({
        code: 'NODEJS-12',
        name: 'Node Js Thang 12',
        tuitionFee: 5000000,
        publicationState: Publication.Draft,
      })
    })
  })

  describe('updateCourse', () => {
    it(`throws error if couldn't find course to update`, async () => {
      expect.assertions(1)

      jest
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(null)

      await expect(
        courseService.updateCourse(
          {
            id: objectId(),
            orgId: objectId(),
          },
          {
            name: 'Con meo ngu ngoc ne anh',
          },
        ),
      ).rejects.toThrowError(`Couldn't find course to update`)
    })

    it(`returns a course with a new name`, async () => {
      expect.assertions(1)

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

      const creatorId = objectId()
      const orgId = objectId()

      const courseTest = await courseService.createCourse(creatorId, orgId, {
        ...createCourseInput,
        startDate: Date.now(),
      })

      jest
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(courseTest)

      await expect(
        courseService.updateCourse(
          {
            id: objectId(),
            orgId: objectId(),
          },
          {
            name: 'NodeJS Thang Tu - La Loi Noi Doi Cua Anh',
          },
        ),
      ).resolves.toMatchObject({
        code: 'NODEJS-12',
        name: 'NodeJS Thang Tu - La Loi Noi Doi Cua Anh',
        tuitionFee: 5000000,
      })
    })

    it(`returns a course with a new tuitionFee`, async () => {
      expect.assertions(1)

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

      const creatorId = objectId()
      const orgId = objectId()

      const courseTest = await courseService.createCourse(creatorId, orgId, {
        ...createCourseInput,
        startDate: Date.now(),
      })

      jest
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(courseTest)

      await expect(
        courseService.updateCourse(
          {
            id: objectId(),
            orgId: objectId(),
          },
          {
            tuitionFee: 3000,
          },
        ),
      ).resolves.toMatchObject({
        code: 'NODEJS-12',
        name: 'Node Js Thang 12',
        tuitionFee: 3000,
      })
    })

    it(`returns a course with a new lecturerIds`, async () => {
      expect.assertions(1)

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
          startDate: Date.now(),
        },
      )

      jest
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(courseTest)
      const expectLecturerIds: string[] = []
      expectLecturerIds.push(accountLecturer.id)

      const lecturerArray = await courseService.updateCourse(
        {
          id: courseTest.id,
          orgId: courseTest.orgId,
        },
        {
          lecturerIds: [accountLecturer.id],
        },
      )

      await expect(lecturerArray.lecturerIds.toString()).toBe(
        expectLecturerIds.toString(),
      )
    })

    it(`returns a course with a new startDate`, async () => {
      expect.assertions(1)

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
          startDate: Date.now(),
        },
      )

      jest
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(courseTest)

      const updated = await courseService.updateCourse(
        {
          id: courseTest.id,
          orgId: courseTest.orgId,
        },
        {
          startDate: '2018-3-3',
        },
      )
      const dateUpdated = new Date(updated.startDate).toString()
      const expectDate = new Date(
        new Date('2018-3-3').setHours(7, 0, 0, 0),
      ).toString()
      expect(dateUpdated).toBe(expectDate)
    })
  })

  describe('findAndPaginateCourses', () => {
    it('returns array course and count find and pagination course', async () => {
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
        address: '25A Mai Thị Lựu',
        createdByAccountId: creatorAccount.id,
        name: 'Kmin Quận 1',
        orgId: org.id,
        phone: '0704917152',
      })

      const listCreatedCourses: ANY[] = []
      const date = new Date()
      const createCourse: CreateCourseInput = {
        academicSubjectId: academicSubject.id,
        orgOfficeId: orgOffice.id,
        code: 'FEBCT1',
        name: 'Frontend cơ bản tháng 1',
        startDate: date.toString(),
        tuitionFee: 5000000,
        lecturerIds: [lecturerAccount.id],
      }

      listCreatedCourses.push(
        await courseService.createCourse(creatorAccount.id, org.id, {
          ...createCourse,
        }),
      )

      listCreatedCourses.push(
        await courseService.createCourse(creatorAccount.id, org.id, {
          ...createCourse,
          code: 'FEBCT2',
          name: 'Lập trình Frontend cơ bản tháng 2',
        }),
      )

      listCreatedCourses.push(
        await courseService.createCourse(creatorAccount.id, org.id, {
          ...createCourse,
          code: 'FEBCT2',
          name: 'Lập trình Backend cơ bản tháng 2',
        }),
      )

      listCreatedCourses.push(
        await courseService.createCourse(creatorAccount.id, org.id, {
          ...createCourse,
          code: 'BEBC',
        }),
      )

      await expect(
        courseService.findAndPaginateCourses(
          {
            limit: 2,
            skip: 2,
          },
          {
            orgId: org.id,
          },
        ),
      ).resolves.toMatchObject({
        courses: [
          {
            code: 'FEBCT2',
            name: 'Lập trình Frontend cơ bản tháng 2',
          },
          {
            code: 'FEBCT1',
            name: 'Frontend cơ bản tháng 1',
          },
        ],
        count: listCreatedCourses.length,
      })
    })

    it('returns array course and count find and pagination course with filter', async () => {
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

      const lecturerAccount1 = await accountService.createAccount({
        orgId: org.id,
        email: 'lecturer@gmail.com',
        password: '123456',
        username: 'lecturer',
        roles: ['lecturer'],
        displayName: 'Lecturer',
      })

      const lecturerAccount2 = await accountService.createAccount({
        orgId: org.id,
        email: 'lecturer2@gmail.com',
        password: '123456',
        username: 'lecturer2',
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
        address: '25A Mai Thị Lựu',
        createdByAccountId: creatorAccount.id,
        name: 'Kmin Quận 1',
        orgId: org.id,
        phone: '0704917152',
      })

      const listCreatedCourses: ANY[] = []
      const date = new Date()
      const createCourse: CreateCourseInput = {
        academicSubjectId: academicSubject.id,
        orgOfficeId: orgOffice.id,
        code: 'FEBCT1',
        name: 'Frontend cơ bản tháng 1',
        startDate: date.toString(),
        tuitionFee: 5000000,
        lecturerIds: [lecturerAccount1.id],
      }

      listCreatedCourses.push(
        await courseService.createCourse(creatorAccount.id, org.id, {
          ...createCourse,
        }),
      )

      listCreatedCourses.push(
        await courseService.createCourse(creatorAccount.id, org.id, {
          ...createCourse,
          code: 'FEBCT2',
          name: 'Lập trình Frontend cơ bản tháng 2',
        }),
      )

      listCreatedCourses.push(
        await courseService.createCourse(creatorAccount.id, org.id, {
          ...createCourse,
          code: 'BEBCT1',
          name: 'Lập trình Backend cơ bản tháng 1',
          lecturerIds: [lecturerAccount2.id],
        }),
      )

      listCreatedCourses.push(
        await courseService.createCourse(creatorAccount.id, org.id, {
          ...createCourse,
          code: 'BEBCT2',
          name: 'Lập trình Backend cơ bản tháng 2',
          lecturerIds: [lecturerAccount2.id],
        }),
      )

      await expect(
        courseService.findAndPaginateCourses(
          {
            limit: 2,
            skip: 0,
          },
          {
            orgId: org.id,
            lecturerIds: [lecturerAccount2.id],
          },
        ),
      ).resolves.toMatchObject({
        courses: [
          {
            code: 'BEBCT2',
            name: 'Lập trình Backend cơ bản tháng 2',
          },
          {
            code: 'BEBCT1',
            name: 'Lập trình Backend cơ bản tháng 1',
          },
        ],
        count: listCreatedCourses.length,
      })
    })
  })

  describe('findCourseById', () => {
    it('returns null if not found', async () => {
      expect.assertions(1)

      await expect(
        courseService.findCourseById(objectId(), objectId()),
      ).resolves.toBeNull()
    })

    it('returns a Course if found', async () => {
      expect.assertions(2)

      const orgId = objectId()
      const createrId = objectId()
      const coutseInput: ANY = {
        academicSubjectId: objectId(),
        orgOfficeId: objectId(),
        code: 'NodeJS-12',
        name: 'Node Js Thang 12',
        tuitionFee: 5000000,
        lecturerIds: [],
        startDate: Date.now(),
      }
      const testObject: ANY = {
        name: 'test',
      }

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
        .mockResolvedValueOnce(testObject)
        .mockResolvedValueOnce(testObject)
      jest
        .spyOn(orgOfficeService, 'findOrgOfficeById')
        .mockResolvedValueOnce(testObject)
        .mockResolvedValueOnce(testObject)

      jest
        .spyOn(accountService, 'findOneAccount')
        .mockResolvedValueOnce(testObject)
        .mockResolvedValueOnce(testObject)

      const courseCreated = await courseService.createCourse(
        createrId,
        orgId,
        coutseInput,
      )
      const courseCreated2 = await courseService.createCourse(
        createrId,
        orgId,
        {
          ...coutseInput,
          code: 'NodeJS-13',
          name: 'Node Js Thang 1',
          tuitionFee: 9000000,
        },
      )

      await expect(
        courseService.findCourseById(courseCreated.id, orgId),
      ).resolves.toMatchObject({
        code: 'NODEJS-12',
        name: 'Node Js Thang 12',
        tuitionFee: 5000000,
      })

      await expect(
        courseService.findCourseById(courseCreated2.id, orgId),
      ).resolves.toMatchObject({
        code: 'NODEJS-13',
        name: 'Node Js Thang 1',
        tuitionFee: 9000000,
      })
    })
  })

  describe('addStudentsToCourse', () => {
    const course: ANY = {
      academicSubjectId: objectId(),
      orgOfficeId: objectId(),
      code: 'NodeJS-12',
      name: 'Node Js Thang 12',
      tuitionFee: 5000000,
      startDate: '2021-04-27',
    }

    it('throws error if the course is not found', async () => {
      expect.assertions(1)

      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)

      await expect(
        courseService.addStudentsToCourse(
          {
            orgId: objectId(),
            courseId: objectId(),
          },
          [objectId()],
        ),
      ).rejects.toThrowError("Course isn't found")
    })

    it('throws error if the student account cannot be found', async () => {
      expect.assertions(1)

      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(course as ANY)

      const studentId = objectId()
      await expect(
        courseService.addStudentsToCourse(
          {
            orgId: objectId(),
            courseId: objectId(),
          },
          [studentId],
        ),
      ).rejects.toThrowError(`ID ${studentId} is not found`)
    })

    it(`throws error if the account isn't a student`, async () => {
      expect.assertions(1)

      const account: ANY = {
        orgId: objectId(),
        email: 'hieuliem33@gmail.com',
        password: '123456',
        username: 'liemdang',
        roles: ['owner', 'admin'],
        displayName: 'YamiDoki',
      }

      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(course as ANY)
      jest
        .spyOn(accountService, 'findOneAccount')
        .mockResolvedValueOnce(account as ANY)

      await expect(
        courseService.addStudentsToCourse(
          {
            orgId: objectId(),
            courseId: objectId(),
          },
          [account.id],
        ),
      ).rejects.toThrowError(`${account.displayName} isn't a student`)
    })

    it('throws error if id student already exists in the list', async () => {
      expect.assertions(1)

      const account: ANY = {
        id: objectId(),
        orgId: objectId(),
        email: 'hieuliem33@gmail.com',
        password: '123456',
        username: 'liemdang',
        roles: ['student'],
        displayName: 'YamiDoki',
      }

      const courseData: ANY = {
        ...createCourseInput,
        studentIds: [account.id],
      }

      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(courseData as ANY)
      jest
        .spyOn(accountService, 'findOneAccount')
        .mockResolvedValueOnce(account as ANY)

      await expect(
        courseService.addStudentsToCourse(
          {
            orgId: objectId(),
            courseId: courseData.id,
          },
          [account.id],
        ),
      ).rejects.toThrowError(`${account.displayName} is exists`)
    })

    it('returns the course after updating', async () => {
      expect.assertions(1)

      const org = await orgService.createOrg({
        name: 'kmin-edu',
        namespace: 'Kmin Academic',
      })

      const accountAdmin = await accountService.createAccount({
        orgId: org.id,
        email: 'Adminhieuliem33@gmail.com',
        password: '123456',
        username: 'Adminliemdang',
        roles: ['admin'],
        displayName: 'AdminYamiDoki',
      })

      const accountStudent = await accountService.createAccount({
        orgId: org.id,
        email: 'Studenthieuliem33@gmail.com',
        password: '123456',
        username: 'Studentliemdang',
        roles: ['student'],
        displayName: 'StudentYamiDoki',
      })

      const academicSubject = await academicService.createAcademicSubject({
        name: 'Frontend cơ bản',
        orgId: org.id,
        code: 'FEBASIC',
        description: 'Lập trình frontend cơ bản',
        imageFileId: objectId(),
        createdByAccountId: objectId(),
      })

      const orgOffice = await orgOfficeService.createOrgOffice({
        address: '25 A Mai Thi Lựu',
        createdByAccountId: accountAdmin.id,
        name: 'Kmin Quận 1',
        orgId: org.id,
        phone: '0704917152',
      })

      const courseBefore = await courseService.createCourse(
        accountAdmin.id,
        org.id,
        {
          ...createCourseInput,
          startDate: Date.now(),
          academicSubjectId: academicSubject.id,
          orgOfficeId: orgOffice.id,
        },
      )

      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)

      const studentIds = [accountStudent.id]

      const courseAfter = await courseService.addStudentsToCourse(
        {
          orgId: org.id,
          courseId: courseBefore.id,
        },
        [accountStudent.id],
      )

      await expect(
        JSON.stringify(studentIds) === JSON.stringify(courseAfter.studentIds),
      ).toBeTruthy()
    })
  })

  describe('addLecturersToCourse', () => {
    const course: ANY = {
      academicSubjectId: objectId(),
      orgOfficeId: objectId(),
      code: 'NodeJS-12',
      name: 'Node Js Thang 12',
      tuitionFee: 5000000,
      startDate: '2021-04-27',
    }

    it('throws error if the course is not found', async () => {
      expect.assertions(1)

      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)

      await expect(
        courseService.addLecturersToCourse(
          {
            orgId: objectId(),
            courseId: objectId(),
          },
          [objectId()],
        ),
      ).rejects.toThrowError("Course isn't found")
    })

    it('throws error if the lecturer account cannot be found', async () => {
      expect.assertions(1)

      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(course as ANY)

      const lecturerId = objectId()
      await expect(
        courseService.addLecturersToCourse(
          {
            orgId: objectId(),
            courseId: objectId(),
          },
          [lecturerId],
        ),
      ).rejects.toThrowError(`ID ${lecturerId} is not found`)
    })

    it(`throws error if the account isn't a lecturer`, async () => {
      expect.assertions(1)

      const account: ANY = {
        orgId: objectId(),
        email: 'huynhthanhcanhcanh.top@gmail.com',
        password: '123456',
        username: 'thanhcanh',
        roles: ['owner', 'admin'],
        displayName: 'Thanh Canh',
      }

      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(course as ANY)
      jest
        .spyOn(accountService, 'findOneAccount')
        .mockResolvedValueOnce(account as ANY)

      await expect(
        courseService.addLecturersToCourse(
          {
            orgId: objectId(),
            courseId: objectId(),
          },
          [account.id],
        ),
      ).rejects.toThrowError(`${account.displayName} isn't a lecturer`)
    })

    it('throws error if id lecturer already exists in the list', async () => {
      expect.assertions(1)

      const account: ANY = {
        id: objectId(),
        orgId: objectId(),
        email: 'huynhthanhcanhcanh.top@gmail.com',
        password: '123456',
        username: 'thanhcanh',
        roles: ['lecturer'],
        displayName: 'Thanh Canh',
      }

      const courseData: ANY = {
        ...createCourseInput,
        lecturerIds: [account.id],
      }

      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(courseData as ANY)
      jest
        .spyOn(accountService, 'findOneAccount')
        .mockResolvedValueOnce(account as ANY)

      await expect(
        courseService.addLecturersToCourse(
          {
            orgId: objectId(),
            courseId: courseData.id,
          },
          [account.id],
        ),
      ).rejects.toThrowError(`${account.displayName} is exists`)
    })

    it('returns the course after updating', async () => {
      expect.assertions(1)

      const org = await orgService.createOrg({
        name: 'kmin-edu',
        namespace: 'Kmin Academic',
      })

      const accountAdmin = await accountService.createAccount({
        orgId: org.id,
        email: 'huynhthanhcanhadmin.top@gmail.com',
        password: '123456',
        username: 'thanhcanh',
        roles: ['admin'],
        displayName: 'Thanh Canh',
      })

      const accountLecturer = await accountService.createAccount({
        orgId: org.id,
        email: 'huynhthanhcanhlecturer.top@gmail.com',
        password: '123456',
        username: 'thanhthanh',
        roles: ['lecturer'],
        displayName: 'Thanh Thanh',
      })

      const academicSubject = await academicService.createAcademicSubject({
        name: 'Frontend cơ bản',
        orgId: org.id,
        code: 'FEBASIC',
        description: 'Lập trình frontend cơ bản',
        imageFileId: objectId(),
        createdByAccountId: objectId(),
      })

      const orgOffice = await orgOfficeService.createOrgOffice({
        address: '25 A Mai Thi Lựu',
        createdByAccountId: accountAdmin.id,
        name: 'Kmin Quận 1',
        orgId: org.id,
        phone: '0704917152',
      })

      const courseBefore = await courseService.createCourse(
        accountAdmin.id,
        org.id,
        {
          ...createCourseInput,
          startDate: Date.now(),
          academicSubjectId: academicSubject.id,
          orgOfficeId: orgOffice.id,
        },
      )

      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)

      const lecturerIds = [accountLecturer.id]

      const courseAfter = await courseService.addLecturersToCourse(
        {
          orgId: org.id,
          courseId: courseBefore.id,
        },
        [accountLecturer.id],
      )

      await expect(
        JSON.stringify(lecturerIds) === JSON.stringify(courseAfter.lecturerIds),
      ).toBeTruthy()
    })
  })

  describe('removeLecturersFromCourse', () => {
    const courseDemo: ANY = {
      academicSubjectId: objectId(),
      orgOfficeId: objectId(),
      code: 'NodeJS-12',
      name: 'Node Js Thang 12',
      tuitionFee: 3000,
      startDate: '2021-04-27',
    }

    it(`throws error if couldn't find course to remove lecturers`, async () => {
      expect.assertions(1)

      jest.spyOn(courseService, 'findCourseById').mockResolvedValueOnce(null)

      await expect(
        courseService.removeLecturersFromCourse(
          {
            id: objectId(),
            orgId: objectId(),
          },
          ['6088bcfabac39423861f6102'],
        ),
      ).rejects.toThrowError(`Couldn't find course to remove lecturers`)
    })

    it('throws error if the account cannot be found', async () => {
      expect.assertions(1)

      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(courseDemo as ANY)

      const lecturerId = objectId()
      await expect(
        courseService.removeLecturersFromCourse(
          {
            id: courseDemo.id,
            orgId: courseDemo.orgId,
          },
          [lecturerId],
        ),
      ).rejects.toThrowError(`ID ${lecturerId} is not found`)
    })

    it('throws error if the account is not a lecturer', async () => {
      expect.assertions(1)

      const account: ANY = {
        orgId: objectId(),
        email: 'vanhai0911@gmail.com',
        password: '1234567',
        username: 'haidev',
        roles: ['owner', 'admin'],
        displayName: 'Nguyen Van Hai',
      }

      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(courseDemo as ANY)
      jest
        .spyOn(accountService, 'findOneAccount')
        .mockResolvedValueOnce(account as ANY)

      await expect(
        courseService.removeLecturersFromCourse(
          {
            id: courseDemo.id,
            orgId: courseDemo.orgId,
          },
          [account.id],
        ),
      ).rejects.toThrowError(`${account.displayName} isn't a lecturer`)
    })

    it('throws error if id lecturer is not a lecturer of course', async () => {
      expect.assertions(1)

      const account: ANY = {
        id: objectId(),
        orgId: objectId(),
        email: 'vanhai0911@gmail.com',
        password: '1234567',
        username: 'haidev',
        roles: ['lecturer'],
        displayName: 'Nguyen Van Hai',
      }

      const courseData: ANY = {
        ...createCourseInput,
        lecturerIds: [account.id],
      }

      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(courseData as ANY)
      jest
        .spyOn(accountService, 'findOneAccount')
        .mockResolvedValueOnce(account as ANY)

      await expect(
        courseService.removeLecturersFromCourse(
          {
            id: objectId(),
            orgId: courseData.id,
          },
          [objectId()],
        ),
      ).rejects.toThrowError(
        `${account.displayName} isn't a lecturer of ${courseData.name}`,
      )
    })

    it(`returns the course with updated lecturerIds`, async () => {
      expect.assertions(1)

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

      const accountLecturer2 = await accountService.createAccount({
        orgId: org.id,
        email: 'nguyenvanhai0911@gmail.com',
        password: '1234567',
        username: 'vanhaidev',
        roles: ['lecturer'],
        displayName: 'Nguyen Van Canh',
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
          startDate: Date.now(),
          lecturerIds: [accountLecturer.id, accountLecturer2.id],
        },
      )

      jest
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(courseTest)

      const lecturerIdstest = [accountLecturer2.id]

      const courseUpdate = await courseService.removeLecturersFromCourse(
        {
          id: courseTest.id,
          orgId: courseTest.orgId,
        },
        [accountLecturer.id],
      )
      await expect(
        courseUpdate.lecturerIds.toString() === lecturerIdstest.toString(),
      ).toBeTruthy()
    })
  })

  describe('removeStudentsFromCourse', () => {
    const courseDemo: ANY = {
      academicSubjectId: objectId(),
      orgOfficeId: objectId(),
      code: 'NodeJS-12',
      name: 'Node Js Thang 12',
      tuitionFee: 3000,
      startDate: '2021-04-27',
    }

    it(`throws error if couldn't find course to remove students`, async () => {
      expect.assertions(1)

      jest
        .spyOn(courseService, 'findCourseById')
        .mockResolvedValueOnce(null as ANY)

      await expect(
        courseService.removeStudentsFromCourse(
          {
            id: objectId(),
            orgId: objectId(),
          },
          ['6088bcfabac39423861f6102'],
        ),
      ).rejects.toThrowError(`Couldn't find course to remove students`)
    })

    it('throws error if the account cannot be found', async () => {
      expect.assertions(1)

      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(courseDemo as ANY)

      const studentId = objectId()
      await expect(
        courseService.removeStudentsFromCourse(
          {
            id: courseDemo.id,
            orgId: courseDemo.orgId,
          },
          [studentId],
        ),
      ).rejects.toThrowError(`ID ${studentId} is not found`)
    })

    it('throws error if the account is not a student', async () => {
      expect.assertions(1)

      const account: ANY = {
        orgId: objectId(),
        email: 'vanhai0911@gmail.com',
        password: '1234567',
        username: 'haidev',
        roles: ['owner', 'admin'],
        displayName: 'Nguyen Van Hai',
      }

      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(courseDemo as ANY)
      jest
        .spyOn(accountService, 'findOneAccount')
        .mockResolvedValueOnce(account as ANY)

      await expect(
        courseService.removeStudentsFromCourse(
          {
            id: courseDemo.id,
            orgId: courseDemo.orgId,
          },
          [account.id],
        ),
      ).rejects.toThrowError(`${account.displayName} isn't a student`)
    })

    it('throws error if id student is not a student of course', async () => {
      expect.assertions(1)

      const account: ANY = {
        id: objectId(),
        orgId: objectId(),
        email: 'vanhai0911@gmail.com',
        password: '1234567',
        username: 'haidev',
        roles: ['student'],
        displayName: 'Nguyen Van Hai',
      }

      const courseData: ANY = {
        ...createCourseInput,
        studentIds: [account.id],
      }

      jest
        .spyOn(authService, 'accountHasPermission')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(courseData as ANY)
      jest
        .spyOn(accountService, 'findOneAccount')
        .mockResolvedValueOnce(account as ANY)

      await expect(
        courseService.removeStudentsFromCourse(
          {
            id: objectId(),
            orgId: courseData.id,
          },
          [objectId()],
        ),
      ).rejects.toThrowError(
        `${account.displayName} isn't a student of ${courseData.name}`,
      )
    })

    it(`returns the course with updated studentIds`, async () => {
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
        email: 'vanhai@gmail.com',
        password: '123456',
        username: 'haine',
        roles: ['lecturer'],
        displayName: 'Hai Nguyen',
      })

      const studentAccount = await accountService.createAccount({
        orgId: org.id,
        email: 'vanhai00911@gmail.com',
        password: '123456',
        username: 'hainene',
        roles: ['student'],
        displayName: 'Hai Nguyen',
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
        address: '25 A Mai Thi Lựu',
        createdByAccountId: creatorAccount.id,
        name: 'Kmin Quận 1',
        orgId: org.id,
        phone: '0704917152',
      })

      const date = new Date()
      const createCourse: CreateCourseInput = {
        academicSubjectId: academicSubject.id,
        orgOfficeId: orgOffice.id,
        code: 'FEBCT1',
        name: 'Frontend cơ bản tháng 1',
        startDate: date.toString(),
        tuitionFee: 5000000,
        lecturerIds: [lecturerAccount.id],
      }

      const course = await courseService.createCourse(
        creatorAccount.id,
        org.id,
        {
          ...createCourse,
        },
      )

      await courseService.addStudentsToCourse(
        {
          orgId: org.id,
          courseId: course.id,
        },
        [studentAccount.id],
      )

      const courseUpdate = await courseService.removeStudentsFromCourse(
        {
          id: course.id,
          orgId: course.orgId,
        },
        [studentAccount.id],
      )
      const studentIdsTest = []
      const { studentIds } = courseUpdate as ANY
      await expect(
        studentIds.toString() === studentIdsTest.toString(),
      ).toBeTruthy()
    })
  })

  describe('calculateAvgGradeOfClassworkAssignmentInCourse', () => {
    const optionInput: AvgGradeOfClassworkByCourseOptionInput = {
      limit: 0,
    }

    it('throws error if OrgId invalid', async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(false as ANY)

      await expect(
        courseService.calculateAvgGradeOfClassworkAssignmentInCourse(
          objectId(),
          objectId(),
          optionInput,
        ),
      ).rejects.toThrowError('ORG_ID_INVALID')
    })

    it('throws error if course not found', async () => {
      expect.assertions(1)

      jest.spyOn(orgService, 'validateOrgId').mockResolvedValueOnce(true as ANY)

      await expect(
        courseService.calculateAvgGradeOfClassworkAssignmentInCourse(
          objectId(),
          objectId(),
          optionInput,
        ),
      ).rejects.toThrowError('COURSE_NOT_FOUND')
    })

    it('returns an array of data', async () => {
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
        status: AccountStatus.Active,
      })

      const accStudent2 = await accountService.createAccount({
        orgId: org.id,
        email: 'huynhthanhcanh22.top@gmail.com',
        password: '123456',
        username: 'thanhthanh2',
        roles: ['student'],
        displayName: 'Huynh Thanh Thanh',
        status: AccountStatus.Active,
      })

      const accLecturer = await accountService.createAccount({
        roles: ['lecturer'],
        email: 'huynhthanhcanh1.top@gmail.com',
        password: '123456',
        username: 'thanhcanh',
        orgId: org.id,
        displayName: 'Huynh Thanh Canh',
        status: AccountStatus.Active,
      })

      const accAdmin = await accountService.createAccount({
        roles: ['admin'],
        username: 'thanhcanh123',
        password: '123456',
        orgId: org.id,
        email: 'huynhthanhcanh3.top@gmail.com',
        displayName: 'Huynh Thanh Canh Thanh',
        status: AccountStatus.Active,
      })

      const academicSubject = await academicService.createAcademicSubject({
        orgId: org.id,
        code: 'NODEJS',
        name: 'NodeJS',
        description: 'This is NodeJs',
        createdByAccountId: accAdmin.id,
        imageFileId: objectId(),
      })

      const orgOffice = await orgOfficeService.createOrgOffice({
        name: 'Kmin Quận 1',
        address: '25A',
        createdByAccountId: accAdmin.id,
        orgId: org.id,
        phone: '0704917152',
      })

      const createCourseInput1: ANY = {
        academicSubjectId: academicSubject.id,
        orgOfficeId: orgOffice.id,
        code: 'NodeJS-12',
        name: 'Node Js Thang 12',
        tuitionFee: 5000000,
        lecturerIds: [accLecturer.id],
      }

      const course = await courseService.createCourse(accAdmin.id, org.id, {
        ...createCourseInput1,
        startDate: Date.now(),
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

      await authService.signIn({
        password: '123456',
        usernameOrEmail: 'huynhthanhcanh1.top@gmail.com',
        orgNamespace: 'kmin-edu',
      })

      const createInputWithFile: ANY = {
        classworkId: classwork1.id,
      }

      const classWorkSubmission1 =
        await classworkService.createClassworkSubmission(
          org.id,
          course.id,
          accStudent2.id,
          createInputWithFile,
        )

      classWorkSubmission1.grade = 60
      classWorkSubmission1.save()

      const classWorkSubmission2 =
        await classworkService.createClassworkSubmission(
          org.id,
          course.id,
          accStudent.id,
          createInputWithFile,
        )

      classWorkSubmission2.grade = 50
      classWorkSubmission2.save()

      await expect(
        courseService.calculateAvgGradeOfClassworkAssignmentInCourse(
          course.id,
          org.id,
          optionInput,
        ),
      ).resolves.toMatchObject([
        { avgGrade: 0, classworkTitle: 'Bai tap 3' },
        { avgGrade: 0, classworkTitle: 'Bai tap 2' },
        { avgGrade: 55, classworkTitle: 'Bai tap 1' },
      ])
    })
  })
})
