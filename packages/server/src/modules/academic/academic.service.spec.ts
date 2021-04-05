import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { objectId } from 'core/utils/db'
import { createTestingModule, initTestDb } from 'core/utils/testing'
import { ANY } from 'types'

import { AcademicService } from './academic.service'

describe('academic.service', () => {
  let module: TestingModule
  let academicService: AcademicService
  let mongooseConnection: Connection

  beforeAll(async () => {
    const testDb = await initTestDb()
    mongooseConnection = testDb.mongooseConnection

    module = await createTestingModule(testDb.uri)

    academicService = module.get<AcademicService>(AcademicService)
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
    it(`returns null if Id doesn't exist`, async () => {
      expect.assertions(1)

      await expect(
        academicService.findAcademicSubjectById('99536101b803f71a85798c77'),
      ).resolves.toBeNull()
    })

    it(`returns AcademicSubject if Id does exist`, async () => {
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
})
