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
        academicService.findAcademicSubjectByCode('NESTJS-T1-2021', objectId()),
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
        academicService.findAcademicSubjectByCode('NESTJS-T1-2021', objectId()),
      ).resolves.toMatchObject({
        code: 'NESTJS-T1-2021',
        name: 'NestJs',
        description: 'This is NestJs course',
        publication: 'Draft',
      })
    })
  })
})
