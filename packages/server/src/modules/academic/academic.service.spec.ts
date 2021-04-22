import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { Publication } from 'core'
import { objectId } from 'core/utils/db'
import { createTestingModule, initTestDb } from 'core/utils/testing'
import { ANY } from 'types'

import { AccountService } from '../account/account.service'
import { AuthService } from '../auth/auth.service'
import { OrgService } from '../org/org.service'

import { AcademicService } from './academic.service'

describe('academic.service', () => {
  let module: TestingModule
  let academicService: AcademicService
  let orgService: OrgService
  let authService: AuthService
  let accountService: AccountService
  let mongooseConnection: Connection

  beforeAll(async () => {
    const testDb = await initTestDb()
    mongooseConnection = testDb.mongooseConnection

    module = await createTestingModule(testDb.uri)

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
              orgId,
            },
            {
              limit: 2,
              skip: 1,
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
              orgId,
            },
            {
              limit: 3,
              skip: 2,
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

        await expect(
          academicService.createCourse(objectId(), org.id, {
            ...createCourseInput,
            startDate: Date.now(),
            lecturerIds: [id],
          }),
        ).rejects.toThrowError(`ID ${id} not found`)

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

    describe('updateCourse', () => {})

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

        jest
          .spyOn(academicService['authService'], 'accountHasPermission')
          .mockResolvedValueOnce(true as never)

        jest
          .spyOn(academicService, 'findAcademicSubjectById')
          .mockResolvedValueOnce(testObject)

        jest
          .spyOn(academicService['accountService'], 'findOneAccount')
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
          academicService.findCourseById(courseCreated.id, orgId),
        ).resolves.toMatchObject({
          code: 'NodeJS-13',
          name: 'Node Js Thang 1',
          tuitionFee: 9000000,
        })
      })
    })
  })
})
