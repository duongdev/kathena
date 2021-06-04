import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { createTestingModule, initTestDb } from 'core/utils/testing'
import { AcademicService } from 'modules/academic/academic.service'
import { AccountService } from 'modules/account/account.service'
import { AuthService } from 'modules/auth/auth.service'
import { ClassworkService } from 'modules/classwork/classwork.service'
import { OrgService } from 'modules/org/org.service'
import { OrgOfficeService } from 'modules/orgOffice/orgOffice.service'
import { ANY } from 'types'

import { objectId } from '../../core/utils/db'

import { CommentService } from './comment.service'

describe('comment.service', () => {
  let module: TestingModule
  let commentService: CommentService
  let mongooseConnection: Connection
  let orgService: OrgService
  let accountService: AccountService
  let authService: AuthService
  let academicService: AcademicService
  let orgOfficeService: OrgOfficeService
  let classworkService: ClassworkService

  beforeAll(async () => {
    const testDb = await initTestDb()
    mongooseConnection = testDb.mongooseConnection

    module = await createTestingModule(testDb.uri)

    commentService = module.get<CommentService>(CommentService)
    orgService = module.get<OrgService>(OrgService)
    accountService = module.get<AccountService>(AccountService)
    authService = module.get<AuthService>(AuthService)
    accountService = module.get<AccountService>(AccountService)
    academicService = module.get<AcademicService>(AcademicService)
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
    expect(commentService).toBeDefined()
  })

  describe('createComment', () => {
    it(`throws error "Org ID is invalid" if org id is not valid`, async () => {
      expect.assertions(1)

      await expect(
        commentService.createComment(objectId(), {
          createdByAccountId: objectId(),
          targetId: objectId(),
          content: 'Day la mot cai cmt',
        }),
      ).rejects.toThrowError('Org ID is invalid')
    })

    it(`return a comment`, async () => {
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
        commentService.createComment(org.id, {
          createdByAccountId: accountLecturer.id,
          targetId: classWorkAssignmentTest.id,
          content: 'Day la mot cai cmt test',
        }),
      ).resolves.toMatchObject({
        content: 'Day la mot cai cmt test',
      })
    })
  })

  describe('listCommentByTargetId', () => {
    it(`throws error if orgId invalid`, async () => {
      expect.assertions(1)

      await expect(
        commentService.listCommentByTargetId(
          {
            limit: 2,
          },
          {
            orgId: 'day_la_org_id',
            lastId: objectId(),
            targetId: objectId(),
          },
        ),
      ).rejects.toThrowError(`ORG_ID_INVALID`)
    })

    it(`returns an array of comments`, async () => {
      expect.assertions(3)

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

      const comment1 = await commentService.createComment(org.id, {
        createdByAccountId: accountLecturer.id,
        targetId: classWorkAssignmentTest1.id,
        content: 'cmt 1',
      })

      const comment2 = await commentService.createComment(org.id, {
        createdByAccountId: accountLecturer.id,
        targetId: classWorkAssignmentTest2.id,
        content: 'cmt 2',
      })

      const comment3 = await commentService.createComment(org.id, {
        createdByAccountId: accountLecturer.id,
        targetId: classWorkAssignmentTest1.id,
        content: 'cmt 3',
      })

      const comment4 = await commentService.createComment(org.id, {
        createdByAccountId: accountLecturer.id,
        targetId: classWorkAssignmentTest2.id,
        content: 'cmt 4',
      })

      await expect(
        commentService.listCommentByTargetId(
          {
            limit: 2,
          },
          {
            orgId: org.id,
            lastId: comment3.id,
            targetId: classWorkAssignmentTest1.id,
          },
        ),
      ).resolves.toMatchObject({
        comments: [
          {
            targetId: classWorkAssignmentTest1.id,
            content: comment1.content,
          },
        ],
      })

      await expect(
        commentService.listCommentByTargetId(
          {
            limit: 2,
          },
          {
            orgId: org.id,
            lastId: comment4.id,
            targetId: classWorkAssignmentTest2.id,
          },
        ),
      ).resolves.toMatchObject({
        comments: [
          {
            targetId: classWorkAssignmentTest2.id,
            content: comment2.content,
          },
        ],
      })

      await expect(
        commentService.listCommentByTargetId(
          {
            limit: 2,
          },
          {
            orgId: org.id,
            targetId: classWorkAssignmentTest1.id,
          },
        ),
      ).resolves.toMatchObject({
        comments: [
          {
            targetId: classWorkAssignmentTest1.id,
            content: comment3.content,
          },
          {
            targetId: classWorkAssignmentTest1.id,
            content: comment1.content,
          },
        ],
      })
    })
  })
})
