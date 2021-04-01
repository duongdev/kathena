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

  describe('createAcademicSubject', () => {
    // TODO: DONE
    it(`throws error if code is existing within org`, async () => {
      expect.assertions(2)

      const academicSubjectInput: ANY = {
        orgId: objectId(),
        code: 'NESTJS-T1-2021',
        name: 'NestJs',
        description: 'This is NestJs course',
        createdByAccountId: objectId(),
      }

      // throws err "DUPLICATED_SUBJECT_CODE"
      jest
        .spyOn(academicService['orgService'], 'validateOrgId')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(academicService, 'existsAcademicSubjectByCode')
        .mockResolvedValueOnce(true as never)

      await expect(
        academicService.createAcademicSubject(academicSubjectInput),
      ).rejects.toThrow('DUPLICATED_SUBJECT_CODE')

      // throws err "INVALID_ORG_ID"
      jest
        .spyOn(academicService['orgService'], 'validateOrgId')
        .mockResolvedValueOnce(false as never)

      await expect(
        academicService.createAcademicSubject(academicSubjectInput),
      ).rejects.toThrow('INVALID_ORG_ID')
    })

    // TODO: DONE
    it(`doesn't throw error if code is existing in another org`, async () => {
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
        .mockResolvedValueOnce(false as never)

      await expect(
        academicService.createAcademicSubject(academicSubjectInput),
      ).resolves.toMatchObject({
        name: 'NestJs',
        code: 'NESTJS-T1-2021',
        description: 'This is NestJs course',
        publication: 'Draft',
      })
    })

    it(`code must be normalized`, async () => {
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
        name: 'NestJs',
        code: 'NESTJS-T1-2021',
        description: 'This is NestJs course',
        publication: 'Draft',
      })
    })
  })
})
