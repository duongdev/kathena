import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { objectId } from 'core/utils/db'
import { createTestingModule, initTestDb } from 'core/utils/testing'
import { AcademicService } from 'modules/academic/academic.service'
import { AccountService } from 'modules/account/account.service'
import { AuthService } from 'modules/auth/auth.service'
import { ClassworkService } from 'modules/classwork/classwork.service'
import { CourseService } from 'modules/course/course.service'
import { CreateCourseInput } from 'modules/course/course.type'
import { OrgService } from 'modules/org/org.service'
import { OrgOfficeService } from 'modules/orgOffice/orgOffice.service'

import { ConversationService } from './conversation.service'

describe('conversation.service', () => {
  let module: TestingModule
  let conversationService: ConversationService
  let mongooseConnection: Connection
  let orgService: OrgService
  let accountService: AccountService
  let authService: AuthService
  let academicService: AcademicService
  let orgOfficeService: OrgOfficeService
  let courseService: CourseService
  let classworkService: ClassworkService

  beforeAll(async () => {
    const testDb = await initTestDb()
    mongooseConnection = testDb.mongooseConnection

    module = await createTestingModule(testDb.uri)

    conversationService = module.get<ConversationService>(ConversationService)
    orgService = module.get<OrgService>(OrgService)
    accountService = module.get<AccountService>(AccountService)
    authService = module.get<AuthService>(AuthService)
    accountService = module.get<AccountService>(AccountService)
    academicService = module.get<AcademicService>(AcademicService)
    orgOfficeService = module.get<OrgOfficeService>(OrgOfficeService)
    classworkService = module.get<ClassworkService>(ClassworkService)
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
    expect(conversationService).toBeDefined()
  })

  describe('createConversation', () => {
    it(`throws error "Org ID is invalid" if org id is not valid`, async () => {
      expect.assertions(1)

      await expect(
        conversationService.createConversation(objectId(), {
          createdByAccountId: objectId(),
          roomId: objectId(),
          content: 'Day la mot cai cmt',
        }),
      ).rejects.toThrowError('Org ID is invalid')
    })

    it(`return a conversation`, async () => {
      expect.assertions(1)

      const toDay = new Date()
      const tomorrow = new Date(toDay)
      tomorrow.setDate(toDay.getDate() + 1)

      const createCourseInput: CreateCourseInput = {
        academicSubjectId: objectId(),
        orgOfficeId: objectId(),
        code: 'NodeJS-12',
        name: 'Node Js Thang 12',
        tuitionFee: 5000000,
        lecturerIds: [],
        startDate: tomorrow,
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

      const classWorkAssignmentTest =
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
        conversationService.createConversation(org.id, {
          createdByAccountId: accountLecturer.id,
          roomId: classWorkAssignmentTest.id,
          content: 'Day la mot cai cmt test',
        }),
      ).resolves.toMatchObject({
        content: 'Day la mot cai cmt test',
      })
    })
  })

  describe('listConversationByTargetId', () => {
    it(`throws error if orgId invalid`, async () => {
      expect.assertions(1)

      await expect(
        conversationService.listConversationByTargetId(
          {
            limit: 2,
          },
          {
            orgId: 'day_la_org_id',
            lastId: objectId(),
            roomId: objectId(),
          },
        ),
      ).rejects.toThrowError(`ORG_ID_INVALID`)
    })

    it(`returns an array of conversations`, async () => {
      expect.assertions(3)
      const toDay = new Date()
      const tomorrow = new Date(toDay)
      tomorrow.setDate(toDay.getDate() + 1)

      const createCourseInput: CreateCourseInput = {
        academicSubjectId: objectId(),
        orgOfficeId: objectId(),
        code: 'NodeJS-12',
        name: 'Node Js Thang 12',
        tuitionFee: 5000000,
        lecturerIds: [],
        startDate: tomorrow,
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
        username: 'thanhcanh',
        roles: ['lecturer'],
        displayName: 'Huynh Thanh Canh',
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

      const classWorkAssignmentTest1 =
        await classworkService.createClassworkAssignment(
          accountLecturer.id,
          courseTest.id,
          org.id,
          {
            title: 'Bai Tap Nay Moi Nhat',
            description: '',
          },
        )

      const classWorkAssignmentTest2 =
        await classworkService.createClassworkAssignment(
          accountLecturer.id,
          courseTest.id,
          org.id,
          {
            title: 'Bai Tap Nay Moi Nhat',
            description: '',
          },
        )

      const comment1 = await conversationService.createConversation(org.id, {
        createdByAccountId: accountLecturer.id,
        roomId: classWorkAssignmentTest1.id,
        content: 'cmt 1',
      })

      const comment2 = await conversationService.createConversation(org.id, {
        createdByAccountId: accountLecturer.id,
        roomId: classWorkAssignmentTest2.id,
        content: 'cmt 2',
      })

      const comment3 = await conversationService.createConversation(org.id, {
        createdByAccountId: accountLecturer.id,
        roomId: classWorkAssignmentTest1.id,
        content: 'cmt 3',
      })

      const comment4 = await conversationService.createConversation(org.id, {
        createdByAccountId: accountLecturer.id,
        roomId: classWorkAssignmentTest2.id,
        content: 'cmt 4',
      })

      const expect1 = await conversationService.listConversationByTargetId(
        {
          limit: 2,
        },
        {
          orgId: org.id,
          lastId: comment3.id,
          roomId: classWorkAssignmentTest1.id,
        },
      )

      const resultForExpect1 = {
        conversations: [
          {
            roomId: expect1.conversations[0].roomId,
            content: expect1.conversations[0].content,
          },
        ],
        count: expect1.conversations.length,
      }

      const data1 = {
        conversations: [
          {
            roomId: classWorkAssignmentTest1.id,
            content: comment1.content,
          },
        ],
        count: 1,
      }

      expect(
        JSON.stringify(resultForExpect1) === JSON.stringify(data1),
      ).toBeTruthy()

      const expect2 = await conversationService.listConversationByTargetId(
        {
          limit: 2,
        },
        {
          orgId: org.id,
          lastId: comment4.id,
          roomId: classWorkAssignmentTest2.id,
        },
      )

      const resultForExpect2 = {
        conversations: [
          {
            roomId: expect2.conversations[0].roomId,
            content: expect2.conversations[0].content,
          },
        ],
        count: expect2.conversations.length,
      }

      const data2 = {
        conversations: [
          {
            roomId: classWorkAssignmentTest2.id,
            content: comment2.content,
          },
        ],
        count: 1,
      }
      expect(
        JSON.stringify(resultForExpect2) === JSON.stringify(data2),
      ).toBeTruthy()

      const expect3 = await conversationService.listConversationByTargetId(
        {
          limit: 2,
        },
        {
          orgId: org.id,
          roomId: classWorkAssignmentTest1.id,
        },
      )

      const resultForExpect3 = {
        conversations: [
          {
            roomId: expect3.conversations[0].roomId,
            content: expect3.conversations[0].content,
          },
          {
            roomId: expect3.conversations[1].roomId,
            content: expect3.conversations[1].content,
          },
        ],
        count: expect3.conversations.length,
      }

      const data3 = {
        conversations: [
          {
            roomId: classWorkAssignmentTest1.id,
            content: comment3.content,
          },
          {
            roomId: classWorkAssignmentTest1.id,
            content: comment1.content,
          },
        ],
        count: 2,
      }
      expect(
        JSON.stringify(resultForExpect3) === JSON.stringify(data3),
      ).toBeTruthy()
    })
  })
})
