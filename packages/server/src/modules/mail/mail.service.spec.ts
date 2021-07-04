import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { objectId } from 'core/utils/db'
import { createTestingModule, initTestDb } from 'core/utils/testing'
import { ANY } from 'types'

import { MailService } from './mail.service'

describe('MailService', () => {
  let module: TestingModule
  let mailService: MailService
  let mongooseConnection: Connection

  beforeAll(async () => {
    const testDb = await initTestDb()
    mongooseConnection = testDb.mongooseConnection

    module = await createTestingModule(testDb.uri)

    mailService = module.get<MailService>(MailService)
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
    expect(mailService).toBeDefined()
  })

  describe('sendNewClassworkAssignmentNotification', () => {
    it('returns true if email is sent successfully', async () => {
      expect.assertions(1)

      const account: ANY = {
        id: objectId(),
        displayName: 'Thanh Canh',
        email: 'kmintestmail@yopmail.com',
      }

      const classworkAssignment: ANY = {
        id: objectId(),
      }

      const course: ANY = {
        id: objectId(),
        name: 'NodeJS_T1',
      }

      await expect(
        mailService.sendNewClassworkAssignmentNotification(
          account,
          course.name,
          classworkAssignment.id,
        ),
      ).toBeTruthy()
    })
  })

  describe('sendOTP', () => {
    it('returns true if email is sent successfully', async () => {
      expect.assertions(2)

      const account: ANY = {
        id: objectId(),
        displayName: 'Minh Nhật',
        email: 'kmintestmail@yopmail.com',
        otp: '123',
        otpExpired: new Date(),
      }

      await expect(mailService.sendOTP(account, 'ACTIVE_ACCOUNT')).toBeTruthy()

      await expect(mailService.sendOTP(account, 'RESET_PASSWORD')).toBeTruthy()
    })
  })

  describe('gradedAssignment', () => {
    it('returns true if email is sent successfully', async () => {
      expect.assertions(1)

      const account: ANY = {
        id: objectId(),
        displayName: 'Yami Doki',
        email: 'kmintestmail@yopmail.com',
      }

      const classworkAssignment: ANY = {
        id: objectId(),
      }

      const course: ANY = {
        id: objectId(),
        name: 'NodeJS_T1',
      }

      await expect(
        mailService.gradedAssignment(account, classworkAssignment, course.name),
      ).toBeTruthy()
    })
  })
})
