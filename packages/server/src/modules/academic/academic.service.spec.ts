import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { Publication } from 'core'
import { objectId } from 'core/utils/db'
import { createTestingModule, initTestDb } from 'core/utils/testing'
import { AccountStatus } from 'modules/account/models/Account'
import { ClassworkService } from 'modules/classwork/classwork.service'
import { AvgGradeOfClassworkByCourseOptionInput } from 'modules/classwork/classwork.type'
import { OrgOfficeService } from 'modules/orgOffice/orgOffice.service'
import { ANY } from 'types'

import { AccountService } from '../account/account.service'
import { AuthService } from '../auth/auth.service'
import { OrgService } from '../org/org.service'

import { AcademicService } from './academic.service'
import { CreateCourseInput } from './academic.type'
import { Lesson } from './models/Lesson'

describe('academic.service', () => {
  let module: TestingModule
  let academicService: AcademicService
  let orgService: OrgService
  let orgOfficeService: OrgOfficeService
  let authService: AuthService
  let accountService: AccountService
  let mongooseConnection: Connection
  let classworkService: ClassworkService

  beforeAll(async () => {
    const testDb = await initTestDb()
    mongooseConnection = testDb.mongooseConnection

    module = await createTestingModule(testDb.uri)

    academicService = module.get<AcademicService>(AcademicService)
    orgService = module.get<OrgService>(OrgService)
    orgOfficeService = module.get<OrgOfficeService>(OrgOfficeService)
    authService = module.get<AuthService>(AuthService)
    accountService = module.get<AccountService>(AccountService)
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
    expect(academicService).toBeDefined()
  })

  describe('AcademicSubject', () => {
    describe('existsAcademicSubjectByCode', () => {
      it('returns true if it exists academic subject by code', async () => {
        expect.assertions(2)

        jest
          .spyOn(academicService['academicSubjectModel'], 'exists')
          .mockResolvedValueOnce(true as never)

        jest
          .spyOn(academicService['academicSubjectModel'], 'exists')
          .mockResolvedValueOnce(true as never)

        await expect(
          academicService.existsAcademicSubjectByCode(
            'NESTJS-T1-2021',
            objectId(),
          ),
        ).resolves.toBeTruthy()

        await expect(
          academicService.existsAcademicSubjectByCode('NESTJS-T1-2021'),
        ).resolves.toBeTruthy()
      })

      it(`returns false if it doesn't exists academic subject by code`, async () => {
        expect.assertions(3)

        await expect(
          academicService.existsAcademicSubjectByCode(
            'NESTJS-T1-2021',
            objectId(),
          ),
        ).resolves.toBeFalsy()

        await expect(
          academicService.existsAcademicSubjectByCode('NESTJS-T1-2021'),
        ).resolves.toBeFalsy()

        await expect(
          academicService.existsAcademicSubjectByCode(''),
        ).resolves.toBeFalsy()
      })
    })

    describe('createAcademicSubject', () => {
      it(`throws error if orgId is invalid`, async () => {
        expect.assertions(1)

        const academicSubjectInput: ANY = {
          orgId: objectId(),
          code: 'NESTJS-T1-2021',
          name: 'NestJs',
          description: 'This is NestJs course',
          createdByAccountId: objectId(),
        }

        jest
          .spyOn(academicService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(false as never)

        await expect(
          academicService.createAcademicSubject(academicSubjectInput),
        ).rejects.toThrow('INVALID_ORG_ID')
      })

      it(`throws error if code is existing within org`, async () => {
        expect.assertions(1)

        const academicSubjectInput: ANY = {
          orgId: objectId(),
          code: 'NESTJS-T1-2021',
          name: 'NestJs',
          description: 'This is NestJs course',
          createdByAccountId: objectId(),
        }

        jest
          .spyOn(academicService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as never)
        jest
          .spyOn(academicService, 'existsAcademicSubjectByCode')
          .mockResolvedValueOnce(true as never)

        await expect(
          academicService.createAcademicSubject(academicSubjectInput),
        ).rejects.toThrow('DUPLICATED_SUBJECT_CODE')
      })

      it(`doesn't throw error if code is existing in another org and returns academic subject`, async () => {
        expect.assertions(2)

        const academicSubjectInput1: ANY = {
          orgId: objectId(),
          code: 'NESTJS-T1-2021',
          name: 'NestJs',
          description: 'This is NestJs course',
          createdByAccountId: objectId(),
        }

        jest
          .spyOn(academicService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)
        jest
          .spyOn(academicService, 'existsAcademicSubjectByCode')
          .mockResolvedValueOnce(false as never)
          .mockResolvedValueOnce(false as never)

        await expect(
          academicService.createAcademicSubject(academicSubjectInput1),
        ).resolves.toMatchObject({
          name: 'NestJs',
          code: 'NESTJS-T1-2021',
          description: 'This is NestJs course',
          publication: 'Draft',
        })

        // code: 'n e s t j s - t 1 - 2 0 2 1'
        const academicSubjectInput2: ANY = {
          orgId: objectId(),
          code: 'n e s t j s - t 1 - 2 0 2 1',
          name: 'NestJs',
          description: 'This is NestJs course',
          createdByAccountId: objectId(),
        }

        await expect(
          academicService.createAcademicSubject(academicSubjectInput2),
        ).resolves.toMatchObject({
          name: 'NestJs',
          code: 'NESTJS-T1-2021',
          description: 'This is NestJs course',
          publication: 'Draft',
        })
      })

      it(`code must be normalized`, async () => {
        expect.assertions(2)

        const academicSubjectInput: ANY = {
          orgId: objectId(),
          code: 'NESTJS-   T1-2   021 ',
          name: 'NestJs',
          description: 'This is NestJs course',
          createdByAccountId: objectId(),
        }

        jest
          .spyOn(academicService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)
        jest
          .spyOn(academicService, 'existsAcademicSubjectByCode')
          .mockResolvedValueOnce(false as never)
          .mockResolvedValueOnce(false as never)

        await expect(
          academicService.createAcademicSubject(academicSubjectInput),
        ).resolves.toMatchObject({
          code: 'NESTJS-T1-2021',
        })

        // code: 'n e s t j s - t 1 - 2 0 2 1'
        const academicSubjectInput2: ANY = {
          orgId: objectId(),
          code: 'n e s t j s - t 1 - 2 0 2 1',
          name: 'NestJs',
          description: 'This is NestJs course',
          createdByAccountId: objectId(),
        }

        await expect(
          academicService.createAcademicSubject(academicSubjectInput2),
        ).resolves.toMatchObject({
          name: 'NestJs',
          code: 'NESTJS-T1-2021',
          description: 'This is NestJs course',
          publication: 'Draft',
        })
      })

      it(`publication must be Draft`, async () => {
        expect.assertions(1)

        const academicSubjectInput: ANY = {
          orgId: objectId(),
          code: 'NESTJS-   T1-2   021 ',
          name: 'NestJs',
          description: 'This is NestJs course',
          createdByAccountId: objectId(),
        }

        jest
          .spyOn(academicService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as never)
        jest
          .spyOn(academicService, 'existsAcademicSubjectByCode')
          .mockResolvedValueOnce(false as never)

        await expect(
          academicService.createAcademicSubject(academicSubjectInput),
        ).resolves.toMatchObject({
          publication: 'Draft',
        })
      })
    })

    describe('findAcademicSubjectByCode', () => {
      it(`returns null if code or orgId doesn't exist`, async () => {
        expect.assertions(2)

        await expect(
          academicService.findAcademicSubjectByCode(
            'NESTJS-T1-2021',
            objectId(),
          ),
        ).resolves.toBeNull()

        await expect(
          academicService.findAcademicSubjectByCode('NESTJS-T1-2021'),
        ).resolves.toBeNull()
      })

      it('returns an academic subject if code exists', async () => {
        expect.assertions(2)

        const academicSubject: ANY = {
          code: 'NESTJS-T1-2021',
          name: 'NestJs',
          description: 'This is NestJs course',
          publication: 'Draft',
          createdByAccountId: objectId(),
        }

        jest
          .spyOn(academicService['academicSubjectModel'], 'findOne')
          .mockResolvedValueOnce(academicSubject)
          .mockResolvedValueOnce(academicSubject)

        await expect(
          academicService.findAcademicSubjectByCode('NESTJS-T1-2021'),
        ).resolves.toMatchObject({
          code: 'NESTJS-T1-2021',
          name: 'NestJs',
          description: 'This is NestJs course',
          publication: 'Draft',
        })

        await expect(
          academicService.findAcademicSubjectByCode(
            'NESTJS-T1-2021',
            objectId(),
          ),
        ).resolves.toMatchObject({
          code: 'NESTJS-T1-2021',
          name: 'NestJs',
          description: 'This is NestJs course',
          publication: 'Draft',
        })
      })
    })

    describe('findAndPaginateAcademicSubjects', () => {
      it('returns array academic subject and count find and pagination academic subject', async () => {
        expect.assertions(2)

        jest
          .spyOn(academicService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)

        const orgId = objectId()
        const listCreatedAcademicSubject: ANY[] = []

        const createAcademicSubjectInput: {
          orgId: string
          code: string
          name: string
          description: string
          createdByAccountId: string
          imageFileId: string
        } = {
          orgId,
          code: 'FEBC01',
          name: 'Frontend cơ bản',
          description: 'Lập trình frontend cơ bản',
          createdByAccountId: objectId(),
          imageFileId: objectId(),
        }

        listCreatedAcademicSubject.push(
          await academicService.createAcademicSubject({
            ...createAcademicSubjectInput,
          }),
        )

        listCreatedAcademicSubject.push(
          await academicService.createAcademicSubject({
            ...createAcademicSubjectInput,
            code: 'FEBC02',
          }),
        )

        listCreatedAcademicSubject.push(
          await academicService.createAcademicSubject({
            ...createAcademicSubjectInput,
            code: 'FEBC03',
          }),
        )

        listCreatedAcademicSubject.push(
          await academicService.createAcademicSubject({
            ...createAcademicSubjectInput,
            code: 'FEBC04',
          }),
        )

        listCreatedAcademicSubject.push(
          await academicService.createAcademicSubject({
            ...createAcademicSubjectInput,
            code: 'FEBC05',
          }),
        )

        await expect(
          academicService.findAndPaginateAcademicSubjects(
            {
              limit: 2,
              skip: 1,
            },
            {
              orgId,
            },
          ),
        ).resolves.toMatchObject({
          academicSubjects: [
            {
              code: 'FEBC04',
            },
            {
              code: 'FEBC03',
            },
          ],
          count: listCreatedAcademicSubject.length,
        })

        await expect(
          academicService.findAndPaginateAcademicSubjects(
            {
              limit: 3,
              skip: 2,
            },
            {
              orgId,
            },
          ),
        ).resolves.toMatchObject({
          academicSubjects: [
            {
              code: 'FEBC03',
            },
            {
              code: 'FEBC02',
            },
            {
              code: 'FEBC01',
            },
          ],
          count: listCreatedAcademicSubject.length,
        })
      })
    })

    describe('findAcademicSubjectById', () => {
      it(`returns null if Id doesn't exists`, async () => {
        expect.assertions(1)

        await expect(
          academicService.findAcademicSubjectById('99536101b803f71a85798c77'),
        ).resolves.toBeNull()
      })

      it(`returns AcademicSubject if Id does exists`, async () => {
        expect.assertions(1)

        jest
          .spyOn(academicService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as never)

        const createAcademicSubjectInput: {
          orgId: string
          code: string
          name: string
          description: string
          createdByAccountId: string
          imageFileId: string
        } = {
          orgId: objectId(),
          code: 'FEBC01',
          name: 'Frontend cơ bản',
          description: 'Lập trình frontend cơ bản',
          createdByAccountId: objectId(),
          imageFileId: objectId(),
        }

        const academicSubject = await academicService.createAcademicSubject(
          createAcademicSubjectInput,
        )

        await expect(
          academicService.findAcademicSubjectById(academicSubject.id),
        ).resolves.toMatchObject({
          code: 'FEBC01',
          name: 'Frontend cơ bản',
          description: 'Lập trình frontend cơ bản',
        })
      })
    })

    describe('updateAcademicSubjectPublicationById', () => {
      it(`throws error if couldn't find academic subject to publication`, async () => {
        expect.assertions(1)
        await expect(
          academicService.updateAcademicSubjectPublication(
            objectId(),
            Publication.Draft,
          ),
        ).rejects.toThrow(
          `Couldn't find academic subject to update publication`,
        )
      })

      it(`returns an academic subject with new publication`, async () => {
        expect.assertions(1)

        jest
          .spyOn(academicService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as never)

        const createAcademicSubjectInput: {
          orgId: string
          code: string
          name: string
          description: string
          createdByAccountId: string
          imageFileId: string
        } = {
          orgId: objectId(),
          code: 'FEBC01',
          name: 'Frontend cơ bản',
          description: 'Lập trình frontend cơ bản',
          createdByAccountId: objectId(),
          imageFileId: objectId(),
        }

        const academicSubject = await academicService.createAcademicSubject(
          createAcademicSubjectInput,
        )

        await expect(
          academicService.updateAcademicSubjectPublication(
            academicSubject.id,
            Publication.Published,
          ),
        ).resolves.toMatchObject({
          code: 'FEBC01',
          name: 'Frontend cơ bản',
          description: 'Lập trình frontend cơ bản',
          publication: Publication.Published,
        })
      })
    })

    describe('updateAcademicSubject', () => {
      it(`throws error if couldn't find academic subject to update`, async () => {
        expect.assertions(1)

        jest
          .spyOn(academicService['academicSubjectModel'], 'findOne')
          .mockResolvedValueOnce(null)

        await expect(
          academicService.updateAcademicSubject(
            {
              id: objectId(),
              orgId: objectId(),
            },
            {
              name: 'Frontend cơ bản',
            },
          ),
        ).rejects.toThrow(`Couldn't find academic subject to update`)
      })

      it(`returns an academic subject with a new name`, async () => {
        expect.assertions(1)

        const org = await orgService.createOrg({
          namespace: 'kmin-edu',
          name: 'Kmin Academy',
        })

        const academicSubject = await academicService.createAcademicSubject({
          name: 'Frontend cơ bản',
          orgId: org.id,
          code: 'FEBASIC',
          description: 'Lập trình frontend cơ bản',
          imageFileId: objectId(),
          createdByAccountId: objectId(),
        })

        jest
          .spyOn(academicService['academicSubjectModel'], 'findOne')
          .mockResolvedValueOnce(academicSubject)

        await expect(
          academicService.updateAcademicSubject(
            {
              id: academicSubject.id,
              orgId: academicSubject.orgId,
            },
            {
              name: 'Frontend nâng cao',
            },
          ),
        ).resolves.toMatchObject({
          code: 'FEBASIC',
          description: 'Lập trình frontend cơ bản',
          name: 'Frontend nâng cao',
        })
      })

      it(`returns an academic subject with a new description`, async () => {
        expect.assertions(1)

        const org = await orgService.createOrg({
          namespace: 'kmin-edu',
          name: 'Kmin Academy',
        })

        const academicSubject = await academicService.createAcademicSubject({
          name: 'Frontend cơ bản',
          orgId: org.id,
          code: 'FEBASIC',
          description: 'Lập trình frontend cơ bản',
          imageFileId: objectId(),
          createdByAccountId: objectId(),
        })

        jest
          .spyOn(academicService['academicSubjectModel'], 'findOne')
          .mockResolvedValueOnce(academicSubject)

        await expect(
          academicService.updateAcademicSubject(
            {
              id: academicSubject.id,
              orgId: academicSubject.orgId,
            },
            {
              description: 'Lập trình quá dễ hahaha',
            },
          ),
        ).resolves.toMatchObject({
          code: 'FEBASIC',
          name: 'Frontend cơ bản',
          description: 'Lập trình quá dễ hahaha',
        })
      })
    })
  })

  describe('Course', () => {
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
          academicService.createCourse(objectId(), objectId(), {
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
          academicService.createCourse(objectId(), objectId(), {
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
          academicService.createCourse(objectId(), objectId(), {
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
          academicService.createCourse(objectId(), objectId(), {
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
          academicService.createCourse(objectId(), org.id, {
            ...createCourseInput,
            startDate: Date.now(),
            lecturerIds: [id],
          }),
        ).rejects.toThrowError(`ID ${id} is not found`)

        await expect(
          academicService.createCourse(objectId(), org.id, {
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
          academicService.createCourse(creatorId, orgId, {
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
          .spyOn(academicService['courseModel'], 'findOne')
          .mockResolvedValueOnce(null)

        await expect(
          academicService.updateCourse(
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

        const courseTest = await academicService.createCourse(
          creatorId,
          orgId,
          {
            ...createCourseInput,
            startDate: Date.now(),
          },
        )

        jest
          .spyOn(academicService['courseModel'], 'findOne')
          .mockResolvedValueOnce(courseTest)

        await expect(
          academicService.updateCourse(
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

        const courseTest = await academicService.createCourse(
          creatorId,
          orgId,
          {
            ...createCourseInput,
            startDate: Date.now(),
          },
        )

        jest
          .spyOn(academicService['courseModel'], 'findOne')
          .mockResolvedValueOnce(courseTest)

        await expect(
          academicService.updateCourse(
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

        const courseTest = await academicService.createCourse(
          objectId(),
          accountLecturer.orgId,
          {
            ...createCourseInput,
            startDate: Date.now(),
          },
        )

        jest
          .spyOn(academicService['courseModel'], 'findOne')
          .mockResolvedValueOnce(courseTest)
        const expectLecturerIds: string[] = []
        expectLecturerIds.push(accountLecturer.id)

        const lecturerArray = await academicService.updateCourse(
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

        const courseTest = await academicService.createCourse(
          objectId(),
          accountLecturer.orgId,
          {
            ...createCourseInput,
            startDate: Date.now(),
          },
        )

        jest
          .spyOn(academicService['courseModel'], 'findOne')
          .mockResolvedValueOnce(courseTest)

        const updated = await academicService.updateCourse(
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
          await academicService.createCourse(creatorAccount.id, org.id, {
            ...createCourse,
          }),
        )

        listCreatedCourses.push(
          await academicService.createCourse(creatorAccount.id, org.id, {
            ...createCourse,
            code: 'FEBCT2',
            name: 'Lập trình Frontend cơ bản tháng 2',
          }),
        )

        listCreatedCourses.push(
          await academicService.createCourse(creatorAccount.id, org.id, {
            ...createCourse,
            code: 'FEBCT2',
            name: 'Lập trình Backend cơ bản tháng 2',
          }),
        )

        listCreatedCourses.push(
          await academicService.createCourse(creatorAccount.id, org.id, {
            ...createCourse,
            code: 'BEBC',
          }),
        )

        await expect(
          academicService.findAndPaginateCourses(
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
          await academicService.createCourse(creatorAccount.id, org.id, {
            ...createCourse,
          }),
        )

        listCreatedCourses.push(
          await academicService.createCourse(creatorAccount.id, org.id, {
            ...createCourse,
            code: 'FEBCT2',
            name: 'Lập trình Frontend cơ bản tháng 2',
          }),
        )

        listCreatedCourses.push(
          await academicService.createCourse(creatorAccount.id, org.id, {
            ...createCourse,
            code: 'BEBCT1',
            name: 'Lập trình Backend cơ bản tháng 1',
            lecturerIds: [lecturerAccount2.id],
          }),
        )

        listCreatedCourses.push(
          await academicService.createCourse(creatorAccount.id, org.id, {
            ...createCourse,
            code: 'BEBCT2',
            name: 'Lập trình Backend cơ bản tháng 2',
            lecturerIds: [lecturerAccount2.id],
          }),
        )

        await expect(
          academicService.findAndPaginateCourses(
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
          academicService.findCourseById(objectId(), objectId()),
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
          .spyOn(academicService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)

        jest
          .spyOn(academicService['authService'], 'accountHasPermission')
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
          .spyOn(academicService['accountService'], 'findOneAccount')
          .mockResolvedValueOnce(testObject)
          .mockResolvedValueOnce(testObject)

        const courseCreated = await academicService.createCourse(
          createrId,
          orgId,
          coutseInput,
        )
        const courseCreated2 = await academicService.createCourse(
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
          academicService.findCourseById(courseCreated.id, orgId),
        ).resolves.toMatchObject({
          code: 'NODEJS-12',
          name: 'Node Js Thang 12',
          tuitionFee: 5000000,
        })

        await expect(
          academicService.findCourseById(courseCreated2.id, orgId),
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
          academicService.addStudentsToCourse(
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
          .spyOn(academicService['courseModel'], 'findOne')
          .mockResolvedValueOnce(course as ANY)

        const studentId = objectId()
        await expect(
          academicService.addStudentsToCourse(
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
          .spyOn(academicService['courseModel'], 'findOne')
          .mockResolvedValueOnce(course as ANY)
        jest
          .spyOn(accountService, 'findOneAccount')
          .mockResolvedValueOnce(account as ANY)

        await expect(
          academicService.addStudentsToCourse(
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
          .spyOn(academicService['courseModel'], 'findOne')
          .mockResolvedValueOnce(courseData as ANY)
        jest
          .spyOn(accountService, 'findOneAccount')
          .mockResolvedValueOnce(account as ANY)

        await expect(
          academicService.addStudentsToCourse(
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

        const courseBefore = await academicService.createCourse(
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

        const courseAfter = await academicService.addStudentsToCourse(
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
          academicService.addLecturersToCourse(
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
          .spyOn(academicService['courseModel'], 'findOne')
          .mockResolvedValueOnce(course as ANY)

        const lecturerId = objectId()
        await expect(
          academicService.addLecturersToCourse(
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
          .spyOn(academicService['courseModel'], 'findOne')
          .mockResolvedValueOnce(course as ANY)
        jest
          .spyOn(accountService, 'findOneAccount')
          .mockResolvedValueOnce(account as ANY)

        await expect(
          academicService.addLecturersToCourse(
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
          .spyOn(academicService['courseModel'], 'findOne')
          .mockResolvedValueOnce(courseData as ANY)
        jest
          .spyOn(accountService, 'findOneAccount')
          .mockResolvedValueOnce(account as ANY)

        await expect(
          academicService.addLecturersToCourse(
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

        const courseBefore = await academicService.createCourse(
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

        const courseAfter = await academicService.addLecturersToCourse(
          {
            orgId: org.id,
            courseId: courseBefore.id,
          },
          [accountLecturer.id],
        )

        await expect(
          JSON.stringify(lecturerIds) ===
            JSON.stringify(courseAfter.lecturerIds),
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

        jest
          .spyOn(academicService, 'findCourseById')
          .mockResolvedValueOnce(null)

        await expect(
          academicService.removeLecturersFromCourse(
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
          .spyOn(academicService['courseModel'], 'findOne')
          .mockResolvedValueOnce(courseDemo as ANY)

        const lecturerId = objectId()
        await expect(
          academicService.removeLecturersFromCourse(
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
          .spyOn(academicService['courseModel'], 'findOne')
          .mockResolvedValueOnce(courseDemo as ANY)
        jest
          .spyOn(accountService, 'findOneAccount')
          .mockResolvedValueOnce(account as ANY)

        await expect(
          academicService.removeLecturersFromCourse(
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
          .spyOn(academicService['courseModel'], 'findOne')
          .mockResolvedValueOnce(courseData as ANY)
        jest
          .spyOn(accountService, 'findOneAccount')
          .mockResolvedValueOnce(account as ANY)

        await expect(
          academicService.removeLecturersFromCourse(
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

        const courseTest = await academicService.createCourse(
          objectId(),
          accountLecturer.orgId,
          {
            ...createCourseInput,
            startDate: Date.now(),
            lecturerIds: [accountLecturer.id, accountLecturer2.id],
          },
        )

        jest
          .spyOn(academicService['courseModel'], 'findOne')
          .mockResolvedValueOnce(courseTest)

        const lecturerIdstest = [accountLecturer2.id]

        const courseUpdate = await academicService.removeLecturersFromCourse(
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
          .spyOn(academicService, 'findCourseById')
          .mockResolvedValueOnce(null)

        await expect(
          academicService.removeStudentsFromCourse(
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
          .spyOn(academicService['courseModel'], 'findOne')
          .mockResolvedValueOnce(courseDemo as ANY)

        const studentId = objectId()
        await expect(
          academicService.removeStudentsFromCourse(
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
          .spyOn(academicService['courseModel'], 'findOne')
          .mockResolvedValueOnce(courseDemo as ANY)
        jest
          .spyOn(accountService, 'findOneAccount')
          .mockResolvedValueOnce(account as ANY)

        await expect(
          academicService.removeStudentsFromCourse(
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
          .spyOn(academicService['courseModel'], 'findOne')
          .mockResolvedValueOnce(courseData as ANY)
        jest
          .spyOn(accountService, 'findOneAccount')
          .mockResolvedValueOnce(account as ANY)

        await expect(
          academicService.removeStudentsFromCourse(
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

        const course = await academicService.createCourse(
          creatorAccount.id,
          org.id,
          {
            ...createCourse,
          },
        )

        await academicService.addStudentsToCourse(
          {
            orgId: org.id,
            courseId: course.id,
          },
          [studentAccount.id],
        )

        const courseUpdate = await academicService.removeStudentsFromCourse(
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
  })

  describe('Lesson', () => {
    const course: ANY = {
      id: objectId(),
      orgId: objectId(),
      name: 'NodeJs',
      code: 'NODEJS',
    }

    const createLessonInput: ANY = {
      startTime: new Date('2021-08-15 14:00'),
      endTime: new Date('2021-08-15 16:30'),
      description: 'Day la buoi 1',
      courseId: course.id,
      orgId: course.orgId,
      publicationState: Publication.Published,
    }

    describe('createLesson', () => {
      it('throws error if org invalid', async () => {
        expect.assertions(1)

        await expect(
          academicService.createLesson(
            objectId(),
            objectId(),
            createLessonInput,
          ),
        ).rejects.toThrowError('Org ID is invalid')
      })

      it('throws error if the account has no permissions', async () => {
        expect.assertions(1)

        jest
          .spyOn(orgService, 'validateOrgId')
          .mockResolvedValueOnce(true as never)

        await expect(
          academicService.createLesson(
            objectId(),
            objectId(),
            createLessonInput,
          ),
        ).rejects.toThrowError(`THIS_COURSE_DOES_NOT_EXIST`)
      })

      it('throws error if course not exist', async () => {
        expect.assertions(1)

        jest
          .spyOn(orgService, 'validateOrgId')
          .mockResolvedValueOnce(true as never)
        jest
          .spyOn(authService, 'canAccountManageCourse')
          .mockResolvedValueOnce(true)

        await expect(
          academicService.createLesson(
            objectId(),
            objectId(),
            createLessonInput,
          ),
        ).rejects.toThrowError('THIS_COURSE_DOES_NOT_EXIST')
      })

      it('throws error if startDate and endDate invalid', async () => {
        expect.assertions(1)

        jest
          .spyOn(orgService, 'validateOrgId')
          .mockResolvedValueOnce(true as never)
        jest
          .spyOn(authService, 'canAccountManageCourse')
          .mockResolvedValueOnce(true)

        jest
          .spyOn(academicService['courseModel'], 'findById')
          .mockResolvedValueOnce(course)

        createLessonInput.startTime = new Date('2021-08-15 14:00')
        createLessonInput.endTime = new Date('2021-08-15 13:00')

        await expect(
          academicService.createLesson(
            objectId(),
            objectId(),
            createLessonInput,
          ),
        ).rejects.toThrowError('START_TIME_OR_END_TIME_INVALID')
      })

      it('throws error if startDate and endDate coincide with other lessons', async () => {
        expect.assertions(4)

        jest
          .spyOn(orgService, 'validateOrgId')
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)

        jest
          .spyOn(authService, 'canAccountManageCourse')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)

        jest
          .spyOn(academicService['courseModel'], 'findById')
          .mockResolvedValueOnce(course)
          .mockResolvedValueOnce(course)
          .mockResolvedValueOnce(course)
          .mockResolvedValueOnce(course)

        createLessonInput.startTime = new Date('2021-08-15 14:00')
        createLessonInput.endTime = new Date('2021-08-15 16:30')

        const lessons: ANY = [
          {
            ...createLessonInput,
          },
        ]

        jest
          .spyOn(academicService['lessonModel'], 'find')
          .mockResolvedValueOnce(lessons)
          .mockResolvedValueOnce(lessons)
          .mockResolvedValueOnce(lessons)
          .mockResolvedValueOnce(lessons)

        createLessonInput.startTime = new Date('2021-08-15 12:00')
        createLessonInput.endTime = new Date('2021-08-15 16:30')

        await expect(
          academicService.createLesson(
            objectId(),
            objectId(),
            createLessonInput,
          ),
        ).rejects.toThrowError('THERE_WAS_A_REHEARSAL_CLASS_DURING_THIS_TIME')

        createLessonInput.startTime = new Date('2021-08-15 15:00')
        createLessonInput.endTime = new Date('2021-08-15 16:00')

        await expect(
          academicService.createLesson(
            objectId(),
            objectId(),
            createLessonInput,
          ),
        ).rejects.toThrowError('THERE_WAS_A_REHEARSAL_CLASS_DURING_THIS_TIME')

        createLessonInput.startTime = new Date('2021-08-15 15:00')
        createLessonInput.endTime = new Date('2021-08-15 17:00')

        await expect(
          academicService.createLesson(
            objectId(),
            objectId(),
            createLessonInput,
          ),
        ).rejects.toThrowError('THERE_WAS_A_REHEARSAL_CLASS_DURING_THIS_TIME')

        createLessonInput.startTime = new Date('2021-08-15 12:00')
        createLessonInput.endTime = new Date('2021-08-15 17:30')

        await expect(
          academicService.createLesson(
            objectId(),
            objectId(),
            createLessonInput,
          ),
        ).rejects.toThrowError('THERE_WAS_A_REHEARSAL_CLASS_DURING_THIS_TIME')
      })

      it('returns a lesson', async () => {
        expect.assertions(1)

        jest
          .spyOn(orgService, 'validateOrgId')
          .mockResolvedValueOnce(true as never)

        jest
          .spyOn(authService, 'canAccountManageCourse')
          .mockResolvedValueOnce(true)

        jest
          .spyOn(academicService['courseModel'], 'findById')
          .mockResolvedValueOnce(course)

        const lessons: ANY = [
          {
            ...createLessonInput,
          },
        ]

        jest
          .spyOn(academicService['lessonModel'], 'find')
          .mockResolvedValueOnce(lessons)

        createLessonInput.startTime = new Date('2021-08-16 12:00')
        createLessonInput.endTime = new Date('2021-08-16 16:30')

        const expectLesson = await academicService.createLesson(
          objectId(),
          objectId(),
          createLessonInput,
        )

        const resultForExpectLesson = {
          courseId: expectLesson.courseId,
          description: expectLesson.description,
          startTime: expectLesson.startTime,
          endTime: expectLesson.endTime,
          publicationState: expectLesson.publicationState,
        }

        const data = {
          courseId: course.id,
          description: 'Day la buoi 1',
          startTime: createLessonInput.startTime,
          endTime: createLessonInput.endTime,
          publicationState: 'Published',
        }

        expect(
          JSON.stringify(resultForExpectLesson) === JSON.stringify(data),
        ).toBeTruthy()
      })
    })

    describe('findAndPaginateLessons', () => {
      it('returns a list lesson by filter', async () => {
        expect.assertions(4)

        jest
          .spyOn(orgService, 'validateOrgId')
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)

        jest
          .spyOn(academicService['courseModel'], 'findById')
          .mockResolvedValueOnce(course)
          .mockResolvedValueOnce(course)
          .mockResolvedValueOnce(course)
          .mockResolvedValueOnce(course)

        const listLessons: ANY = []

        const studentId = objectId()

        jest
          .spyOn(authService, 'canAccountManageCourse')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)

        const lesson1 = await academicService.createLesson(
          course.orgId,
          objectId(),
          {
            ...createLessonInput,
            startTime: new Date('2021-08-15 14:00'),
            endTime: new Date('2021-08-15 16:30'),
          },
        )

        const lesson2 = await academicService.createLesson(
          course.orgId,
          objectId(),
          {
            ...createLessonInput,
            startTime: new Date('2021-08-16 14:00'),
            endTime: new Date('2021-08-16 16:30'),
            description: 'Day la buoi 2',
          },
        )

        lesson2.absentStudentIds = [studentId]
        lesson2.save()

        const lesson3 = await academicService.createLesson(
          course.orgId,
          objectId(),
          {
            ...createLessonInput,
            startTime: new Date('2021-08-17 14:00'),
            endTime: new Date('2021-08-17 16:30'),
            description: 'Day la buoi 3',
          },
        )

        const lesson4 = await academicService.createLesson(
          course.orgId,
          objectId(),
          {
            ...createLessonInput,
            startTime: new Date('2021-08-18 14:00'),
            endTime: new Date('2021-08-18 16:30'),
            description: 'Day la buoi 4',
          },
        )

        lesson4.absentStudentIds = [studentId]
        lesson4.save()

        listLessons.push(lesson1)

        listLessons.push(lesson2)

        listLessons.push(lesson3)

        listLessons.push(lesson4)

        await expect(
          academicService.findAndPaginateLessons(
            {
              skip: 0,
              limit: 2,
            },
            {
              orgId: course.orgId,
              courseId: course.id,
            },
          ),
        ).resolves.toMatchObject({
          count: listLessons.length,
          lessons: [
            {
              description: 'Day la buoi 1',
            },
            {
              description: 'Day la buoi 2',
            },
          ],
        })

        await expect(
          academicService.findAndPaginateLessons(
            {
              skip: 0,
              limit: 2,
            },
            {
              orgId: course.orgId,
              courseId: course.id,
              startTime: new Date('2021-08-16'),
            },
          ),
        ).resolves.toMatchObject({
          count: listLessons.length,
          lessons: [
            {
              description: 'Day la buoi 2',
            },
            {
              description: 'Day la buoi 3',
            },
          ],
        })

        await expect(
          academicService.findAndPaginateLessons(
            {
              skip: 0,
              limit: 2,
            },
            {
              orgId: course.orgId,
              courseId: course.id,
              startTime: new Date('2021-08-16'),
              endTime: new Date('2021-08-18'),
            },
          ),
        ).resolves.toMatchObject({
          count: listLessons.length,
          lessons: [
            {
              description: 'Day la buoi 2',
            },
            {
              description: 'Day la buoi 3',
            },
          ],
        })

        await expect(
          academicService.findAndPaginateLessons(
            {
              skip: 0,
              limit: 2,
            },
            {
              orgId: course.orgId,
              courseId: course.id,
              startTime: new Date('2021-08-16'),
              endTime: new Date('2021-08-18'),
              absentStudentId: studentId,
            },
          ),
        ).resolves.toMatchObject({
          count: listLessons.length,
          lessons: [
            {
              description: 'Day la buoi 2',
            },
          ],
        })
      })
    })

    describe('updateLessonById', () => {
      it('throws error if lesson not found', async () => {
        expect.assertions(1)

        const updateLessonInput: ANY = {
          startTime: new Date(),
          endTime: new Date(),
          description: 'day la buoi 1',
          publicationState: Publication.Published,
        }

        jest
          .spyOn(authService, 'canAccountManageCourse')
          .mockResolvedValueOnce(true)

        await expect(
          academicService.updateLessonById(
            {
              lessonId: objectId(),
              orgId: objectId(),
              courseId: objectId(),
            },
            updateLessonInput,
            objectId(),
          ),
        ).rejects.toThrowError('Lesson not found')
      })

      it('throws error if startTime or endTime invalid', async () => {
        expect.assertions(2)

        const lesson: ANY = {
          id: objectId(),
          orgId: objectId(),
          courseId: objectId(),
          startTime: new Date('2021-08-01 12:00'),
          endTime: new Date('2021-08-01 14:00'),
        }

        jest
          .spyOn(academicService['lessonModel'], 'findOne')
          .mockResolvedValueOnce(lesson)
          .mockResolvedValueOnce(lesson)

        jest
          .spyOn(authService, 'canAccountManageCourse')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)

        await expect(
          academicService.updateLessonById(
            {
              lessonId: lesson.id,
              orgId: lesson.orgId,
              courseId: lesson.courseId,
            },
            {
              startTime: new Date('2021-08-02'),
            },
            objectId(),
          ),
        ).rejects.toThrowError('endTime or startTime invalid')

        await expect(
          academicService.updateLessonById(
            {
              lessonId: lesson.id,
              orgId: lesson.orgId,
              courseId: lesson.courseId,
            },
            {
              endTime: new Date('2021-07-31'),
            },
            objectId(),
          ),
        ).rejects.toThrowError('endTime or startTime invalid')
      })

      it('throws error if startDate and endDate coincide with other lessons', async () => {
        expect.assertions(4)

        const updateLessonInput: ANY = {
          startTime: new Date('2021-08-15 14:00'),
          endTime: new Date('2021-08-15 16:30'),
          description: 'Day la buoi 1',
          publicationState: Publication.Published,
        }

        const lesson: ANY = {
          id: objectId(),
          orgId: objectId(),
          courseId: objectId(),
          startTime: new Date('2021-08-01 12:00'),
          endTime: new Date('2021-08-01 14:00'),
        }

        jest
          .spyOn(academicService['lessonModel'], 'findOne')
          .mockResolvedValueOnce(lesson)
          .mockResolvedValueOnce(lesson)
          .mockResolvedValueOnce(lesson)
          .mockResolvedValueOnce(lesson)

        const lessons: ANY = [
          {
            ...updateLessonInput,
          },
        ]

        jest
          .spyOn(academicService['lessonModel'], 'find')
          .mockResolvedValueOnce(lessons)
          .mockResolvedValueOnce(lessons)
          .mockResolvedValueOnce(lessons)
          .mockResolvedValueOnce(lessons)

        jest
          .spyOn(authService, 'canAccountManageCourse')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)

        await expect(
          academicService.updateLessonById(
            {
              lessonId: lesson.id,
              orgId: lesson.orgId,
              courseId: lesson.courseId,
            },
            updateLessonInput,
            objectId(),
          ),
        ).rejects.toThrowError('THERE_WAS_A_REHEARSAL_CLASS_DURING_THIS_TIME')

        updateLessonInput.startTime = new Date('2021-08-15 15:00')
        updateLessonInput.endTime = new Date('2021-08-15 16:00')

        await expect(
          academicService.updateLessonById(
            {
              lessonId: lesson.id,
              orgId: lesson.orgId,
              courseId: lesson.courseId,
            },
            updateLessonInput,
            objectId(),
          ),
        ).rejects.toThrowError('THERE_WAS_A_REHEARSAL_CLASS_DURING_THIS_TIME')

        updateLessonInput.startTime = new Date('2021-08-15 15:00')
        updateLessonInput.endTime = new Date('2021-08-15 17:00')

        await expect(
          academicService.updateLessonById(
            {
              lessonId: lesson.id,
              orgId: lesson.orgId,
              courseId: lesson.courseId,
            },
            updateLessonInput,
            objectId(),
          ),
        ).rejects.toThrowError('THERE_WAS_A_REHEARSAL_CLASS_DURING_THIS_TIME')

        updateLessonInput.startTime = new Date('2021-08-15 12:00')
        updateLessonInput.endTime = new Date('2021-08-15 17:30')

        await expect(
          academicService.updateLessonById(
            {
              lessonId: lesson.id,
              orgId: lesson.orgId,
              courseId: lesson.courseId,
            },
            updateLessonInput,
            objectId(),
          ),
        ).rejects.toThrowError('THERE_WAS_A_REHEARSAL_CLASS_DURING_THIS_TIME')
      })

      it('returns lessons with new data', async () => {
        expect.assertions(1)

        jest
          .spyOn(orgService, 'validateOrgId')
          .mockResolvedValueOnce(true as never)

        jest
          .spyOn(academicService['courseModel'], 'findById')
          .mockResolvedValueOnce(course)

        jest
          .spyOn(authService, 'canAccountManageCourse')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)

        const lesson = await academicService.createLesson(
          objectId(),
          objectId(),
          {
            ...createLessonInput,
            startTime: new Date('2021-08-01 12:00'),
            endTime: new Date('2021-08-01 14:00'),
          },
        )

        await expect(
          academicService.updateLessonById(
            {
              lessonId: lesson.id,
              orgId: lesson.orgId,
              courseId: lesson.courseId,
            },
            {
              endTime: new Date('2021-08-01 15:00'),
              description: 'day la buoi 2',
            },
            objectId(),
          ),
        ).resolves.toMatchObject({
          description: 'day la buoi 2',
          endTime: new Date('2021-08-01 15:00'),
        })
      })
    })

    describe('addAbsentStudentsToLesson', () => {
      it('throws error if the account has no permissions', async () => {
        expect.assertions(1)

        await expect(
          academicService.addAbsentStudentsToLesson(
            {
              lessonId: objectId(),
              orgId: objectId(),
              courseId: objectId(),
            },
            [objectId()],
            objectId(),
          ),
        ).rejects.toThrowError(`ACCOUNT_CAN'T_MANAGE_COURSE`)
      })

      it('throws error if lesson not found', async () => {
        expect.assertions(1)

        jest
          .spyOn(authService, 'canAccountManageCourse')
          .mockResolvedValueOnce(true)

        await expect(
          academicService.addAbsentStudentsToLesson(
            {
              lessonId: objectId(),
              orgId: objectId(),
              courseId: objectId(),
            },
            [objectId()],
            objectId(),
          ),
        ).rejects.toThrowError('Lesson not found')
      })

      it('throw error if account id is not a student or not found', async () => {
        expect.assertions(2)

        jest
          .spyOn(orgService, 'validateOrgId')
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)

        jest
          .spyOn(authService, 'canAccountManageCourse')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)

        const orgId = objectId()

        const accountLecturer = await accountService.createAccount({
          orgId,
          email: 'huynhthanhcanh1234@gmail.com',
          password: '123456',
          username: 'thanhcanh',
          roles: ['lecturer'],
          displayName: 'Huynh Thanh Canh',
        })

        jest
          .spyOn(academicService['courseModel'], 'findById')
          .mockResolvedValueOnce(course)

        const lesson = await academicService.createLesson(
          orgId,
          objectId(),
          createLessonInput,
        )

        const id = objectId()

        await expect(
          academicService.addAbsentStudentsToLesson(
            {
              lessonId: lesson.id,
              orgId: lesson.orgId,
              courseId: lesson.courseId,
            },
            [id],
            objectId(),
          ),
        ).rejects.toThrowError(`ID ${id} is not found`)

        await expect(
          academicService.addAbsentStudentsToLesson(
            {
              lessonId: lesson.id,
              orgId: lesson.orgId,
              courseId: lesson.courseId,
            },
            [accountLecturer.id],
            objectId(),
          ),
        ).rejects.toThrowError(`${accountLecturer.displayName} isn't a student`)
      })

      it('returns lesson with new absentStudentIds data', async () => {
        expect.assertions(1)

        jest
          .spyOn(orgService, 'validateOrgId')
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)

        jest
          .spyOn(authService, 'canAccountManageCourse')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)

        const orgId = objectId()

        const accountStudent = await accountService.createAccount({
          orgId,
          email: 'huynhthanhcanh1234@gmail.com',
          password: '123456',
          username: 'thanhcanh',
          roles: ['student'],
          displayName: 'Huynh Thanh Canh',
        })

        jest
          .spyOn(academicService['courseModel'], 'findById')
          .mockResolvedValueOnce(course)

        const lesson = await academicService.createLesson(
          orgId,
          objectId(),
          createLessonInput,
        )

        const addAbsentStudentIds =
          await academicService.addAbsentStudentsToLesson(
            {
              lessonId: lesson.id,
              orgId: lesson.orgId,
              courseId: lesson.courseId,
            },
            [accountStudent.id],
            objectId(),
          )

        expect(
          JSON.stringify([accountStudent.id]) ===
            JSON.stringify(addAbsentStudentIds.absentStudentIds),
        ).toBeTruthy()
      })
    })

    describe('removeAbsentStudentsFromLesson', () => {
      it('throws error if the account has no permissions', async () => {
        expect.assertions(1)

        await expect(
          academicService.removeAbsentStudentsFromLesson(
            {
              lessonId: objectId(),
              orgId: objectId(),
              courseId: objectId(),
            },
            [objectId()],
            objectId(),
          ),
        ).rejects.toThrowError(`ACCOUNT_CAN'T_MANAGE_COURSE`)
      })

      it('throws error if lesson not found', async () => {
        expect.assertions(1)

        jest
          .spyOn(authService, 'canAccountManageCourse')
          .mockResolvedValueOnce(true)

        await expect(
          academicService.removeAbsentStudentsFromLesson(
            {
              lessonId: objectId(),
              orgId: objectId(),
              courseId: objectId(),
            },
            [objectId()],
            objectId(),
          ),
        ).rejects.toThrowError('Lesson not found')
      })

      it('throw error if account id is not a student or not found', async () => {
        expect.assertions(2)

        jest
          .spyOn(orgService, 'validateOrgId')
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)

        jest
          .spyOn(authService, 'canAccountManageCourse')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)

        const orgId = objectId()

        const accountLecturer = await accountService.createAccount({
          orgId,
          email: 'huynhthanhcanh1234@gmail.com',
          password: '123456',
          username: 'thanhcanh',
          roles: ['lecturer'],
          displayName: 'Huynh Thanh Canh',
        })

        jest
          .spyOn(academicService['courseModel'], 'findById')
          .mockResolvedValueOnce(course)

        const lesson = await academicService.createLesson(
          orgId,
          objectId(),
          createLessonInput,
        )

        const id = objectId()

        await expect(
          academicService.removeAbsentStudentsFromLesson(
            {
              lessonId: lesson.id,
              orgId: lesson.orgId,
              courseId: lesson.courseId,
            },
            [id],
            objectId(),
          ),
        ).rejects.toThrowError(`ID ${id} is not found`)

        await expect(
          academicService.removeAbsentStudentsFromLesson(
            {
              lessonId: lesson.id,
              orgId: lesson.orgId,
              courseId: lesson.courseId,
            },
            [accountLecturer.id],
            objectId(),
          ),
        ).rejects.toThrowError(`${accountLecturer.displayName} isn't a student`)
      })

      it('returns lesson with new absentStudentIds data', async () => {
        expect.assertions(1)

        jest
          .spyOn(orgService, 'validateOrgId')
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)

        jest
          .spyOn(authService, 'canAccountManageCourse')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)

        const orgId = objectId()

        const accountStudent = await accountService.createAccount({
          orgId,
          email: 'huynhthanhcanh1234@gmail.com',
          password: '123456',
          username: 'thanhcanh',
          roles: ['student'],
          displayName: 'Huynh Thanh Canh',
        })

        jest
          .spyOn(academicService['courseModel'], 'findById')
          .mockResolvedValueOnce(course)

        const lesson = await academicService.createLesson(
          orgId,
          objectId(),
          createLessonInput,
        )

        lesson.absentStudentIds.push(accountStudent.id)
        await lesson.save()

        const addAbsentStudentIds =
          await academicService.removeAbsentStudentsFromLesson(
            {
              lessonId: lesson.id,
              orgId: lesson.orgId,
              courseId: lesson.courseId,
            },
            [accountStudent.id],
            objectId(),
          )

        expect(
          JSON.stringify([]) ===
            JSON.stringify(addAbsentStudentIds.absentStudentIds),
        ).toBeTruthy()
      })
    })

    describe('findLessonById', () => {
      it('throws error if the account has no permissions', async () => {
        expect.assertions(1)

        const lesson: Lesson = {
          id: objectId(),
          orgId: objectId(),
          courseId: objectId(),
        } as Lesson

        jest
          .spyOn(academicService['lessonModel'], 'findOne')
          .mockResolvedValueOnce(lesson as ANY)

        await expect(
          academicService.findLessonById(
            objectId(),
            objectId(),
            lesson.id,
            lesson.orgId,
          ),
        ).rejects.toThrowError(`ACCOUNT_CAN'T_MANAGE_COURSE`)
      })

      it('returns a lesson if found', async () => {
        expect.assertions(1)

        jest
          .spyOn(authService, 'canAccountManageCourse')
          .mockResolvedValueOnce(true)

        const lesson: Lesson = {
          id: objectId(),
          orgId: objectId(),
          courseId: objectId(),
        } as Lesson

        jest
          .spyOn(academicService['lessonModel'], 'findOne')
          .mockResolvedValueOnce(lesson as ANY)

        await expect(
          academicService.findLessonById(
            objectId(),
            objectId(),
            lesson.id,
            lesson.orgId,
          ),
        ).resolves.toMatchObject(lesson)
      })

      it('returns a null if found', async () => {
        expect.assertions(1)

        jest
          .spyOn(authService, 'canAccountManageCourse')
          .mockResolvedValueOnce(true)

        jest
          .spyOn(academicService['lessonModel'], 'findOne')
          .mockResolvedValueOnce(null as ANY)

        await expect(
          academicService.findLessonById(
            objectId(),
            objectId(),
            objectId(),
            objectId(),
          ),
        ).resolves.toBeNull()
      })
    })

    describe('commentsForTheLessonByLecturer', () => {
      const comment = 'hom nay cac ban hoc rat tot'

      it('throws error if the account has no permissions', async () => {
        expect.assertions(1)

        await expect(
          academicService.commentsForTheLessonByLecturer(
            objectId(),
            objectId(),
            {
              lessonId: objectId(),
              courseId: objectId(),
            },
            { comment },
          ),
        ).rejects.toThrowError(`ACCOUNT_CAN'T_MANAGE_COURSE`)
      })

      it('throws error if lesson not found', async () => {
        expect.assertions(1)

        jest
          .spyOn(authService, 'canAccountManageCourse')
          .mockResolvedValueOnce(true)

        await expect(
          academicService.commentsForTheLessonByLecturer(
            objectId(),
            objectId(),
            {
              lessonId: objectId(),
              courseId: objectId(),
            },
            { comment },
          ),
        ).rejects.toThrowError('Lesson not found')
      })

      it('returns lesson with new comment data', async () => {
        expect.assertions(1)

        jest
          .spyOn(orgService, 'validateOrgId')
          .mockResolvedValueOnce(true as never)

        jest
          .spyOn(authService, 'canAccountManageCourse')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)

        const orgId = objectId()

        jest
          .spyOn(academicService['courseModel'], 'findById')
          .mockResolvedValueOnce(course)

        const lesson = await academicService.createLesson(
          orgId,
          objectId(),
          createLessonInput,
        )

        await expect(
          academicService.commentsForTheLessonByLecturer(
            lesson.orgId,
            objectId(),
            {
              lessonId: lesson.id,
              courseId: lesson.courseId,
            },
            { comment },
          ),
        ).resolves.toMatchObject({
          lecturerComment: comment,
        })
      })
    })

    describe('updateLessonPublicationById', () => {
      it(`returns an error if account can't manage course`, async () => {
        expect.assertions(1)
        const input = {
          lessonId: objectId(),
          publicationState: Publication.Published,
          courseId: objectId(),
        }

        await expect(
          academicService.updateLessonPublicationById(input, objectId()),
        ).rejects.toThrowError(`ACCOUNT_CAN'T_MANAGE_COURSE`)
      })

      it('returns an error if the lesson is not found', async () => {
        expect.assertions(1)
        const input = {
          lessonId: objectId(),
          publicationState: Publication.Published,
          courseId: objectId(),
        }

        jest
          .spyOn(academicService['authService'], 'canAccountManageCourse')
          .mockResolvedValueOnce(true as never)

        await expect(
          academicService.updateLessonPublicationById(input, objectId()),
        ).rejects.toThrowError('Lesson not found')
      })

      it('returns a lesson if it updated', async () => {
        expect.assertions(2)
        const input = {
          lessonId: objectId(),
          publicationState: Publication.Published,
          courseId: objectId(),
        }
        const lesson = {
          ...createLessonInput,
          publicationState: input.publicationState,
        }
        jest
          .spyOn(academicService['authService'], 'canAccountManageCourse')
          .mockResolvedValueOnce(true as never)
          .mockResolvedValueOnce(true as never)

        jest
          .spyOn(academicService['lessonModel'], 'findByIdAndUpdate')
          .mockResolvedValueOnce(lesson as ANY)

        await expect(
          academicService.updateLessonPublicationById(input, objectId()),
        ).resolves.toMatchObject(lesson)

        input.publicationState = Publication.Draft

        lesson.publicationState = input.publicationState

        jest
          .spyOn(academicService['lessonModel'], 'findByIdAndUpdate')
          .mockResolvedValueOnce(lesson as ANY)

        await expect(
          academicService.updateLessonPublicationById(input, objectId()),
        ).resolves.toMatchObject(lesson)
      })
    })
  })

  /**
   * START STATISTICAL
   */

  describe('Statistical', () => {
    describe('calculateAvgGradeOfClassworkAssignmentInCourse', () => {
      const optionInput: AvgGradeOfClassworkByCourseOptionInput = {
        limit: 0,
      }

      it('throws error if OrgId invalid', async () => {
        expect.assertions(1)

        jest
          .spyOn(academicService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(false as ANY)

        await expect(
          academicService.calculateAvgGradeOfClassworkAssignmentInCourse(
            objectId(),
            objectId(),
            optionInput,
          ),
        ).rejects.toThrowError('ORG_ID_INVALID')
      })

      it('throws error if course not found', async () => {
        expect.assertions(1)

        jest
          .spyOn(academicService['orgService'], 'validateOrgId')
          .mockResolvedValueOnce(true as ANY)

        await expect(
          academicService.calculateAvgGradeOfClassworkAssignmentInCourse(
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

        const createCourseInput: ANY = {
          academicSubjectId: academicSubject.id,
          orgOfficeId: orgOffice.id,
          code: 'NodeJS-12',
          name: 'Node Js Thang 12',
          tuitionFee: 5000000,
          lecturerIds: [accLecturer.id],
        }

        const course = await academicService.createCourse(accAdmin.id, org.id, {
          ...createCourseInput,
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
          academicService.calculateAvgGradeOfClassworkAssignmentInCourse(
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

  /**
   * END STATISTICAL
   */
})
