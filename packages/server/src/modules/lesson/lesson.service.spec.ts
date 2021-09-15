import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { Publication } from 'core'
import { objectId } from 'core/utils/db'
import { createTestingModule, initTestDb } from 'core/utils/testing'
import { AccountService } from 'modules/account/account.service'
import { AuthService } from 'modules/auth/auth.service'
import { CourseService } from 'modules/course/course.service'
import { OrgService } from 'modules/org/org.service'
import { ANY } from 'types'

import { LessonService } from './lesson.service'
import { LessonsFilterInputStatus, UpdateLessonInput } from './lesson.type'
import { Lesson } from './models/Lesson'

describe('lesson.service', () => {
  let module: TestingModule
  let orgService: OrgService
  let authService: AuthService
  let lessonService: LessonService
  let accountService: AccountService
  let courseService: CourseService
  let mongooseConnection: Connection

  beforeAll(async () => {
    const testDb = await initTestDb()
    mongooseConnection = testDb.mongooseConnection

    module = await createTestingModule(testDb.uri)

    orgService = module.get<OrgService>(OrgService)
    authService = module.get<AuthService>(AuthService)
    lessonService = module.get<LessonService>(LessonService)
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
    expect(lessonService).toBeDefined()
  })

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
        lessonService.createLesson(objectId(), objectId(), createLessonInput),
      ).rejects.toThrowError('Org ID is invalid')
    })

    it('throws error if the account has no permissions', async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      await expect(
        lessonService.createLesson(objectId(), objectId(), createLessonInput),
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
        lessonService.createLesson(objectId(), objectId(), createLessonInput),
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
        .spyOn(courseService['courseModel'], 'findById')
        .mockResolvedValueOnce(course)

      createLessonInput.startTime = new Date('2021-08-15 14:00')
      createLessonInput.endTime = new Date('2021-08-15 13:00')

      await expect(
        lessonService.createLesson(objectId(), objectId(), createLessonInput),
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
        .spyOn(courseService['courseModel'], 'findById')
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
        .spyOn(lessonService['lessonModel'], 'find')
        .mockResolvedValueOnce(lessons)
        .mockResolvedValueOnce(lessons)
        .mockResolvedValueOnce(lessons)
        .mockResolvedValueOnce(lessons)

      createLessonInput.startTime = new Date('2021-08-15 12:00')
      createLessonInput.endTime = new Date('2021-08-15 16:30')

      await expect(
        lessonService.createLesson(objectId(), objectId(), createLessonInput),
      ).rejects.toThrowError('THERE_WAS_A_REHEARSAL_CLASS_DURING_THIS_TIME')

      createLessonInput.startTime = new Date('2021-08-15 15:00')
      createLessonInput.endTime = new Date('2021-08-15 16:00')

      await expect(
        lessonService.createLesson(objectId(), objectId(), createLessonInput),
      ).rejects.toThrowError('THERE_WAS_A_REHEARSAL_CLASS_DURING_THIS_TIME')

      createLessonInput.startTime = new Date('2021-08-15 15:00')
      createLessonInput.endTime = new Date('2021-08-15 17:00')

      await expect(
        lessonService.createLesson(objectId(), objectId(), createLessonInput),
      ).rejects.toThrowError('THERE_WAS_A_REHEARSAL_CLASS_DURING_THIS_TIME')

      createLessonInput.startTime = new Date('2021-08-15 12:00')
      createLessonInput.endTime = new Date('2021-08-15 17:30')

      await expect(
        lessonService.createLesson(objectId(), objectId(), createLessonInput),
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
        .spyOn(courseService['courseModel'], 'findById')
        .mockResolvedValueOnce(course)

      const lessons: ANY = [
        {
          ...createLessonInput,
        },
      ]

      jest
        .spyOn(lessonService['lessonModel'], 'find')
        .mockResolvedValueOnce(lessons)

      createLessonInput.startTime = new Date('2021-08-16 12:00')
      createLessonInput.endTime = new Date('2021-08-16 16:30')

      const expectLesson = await lessonService.createLesson(
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
    const courseId = course.id
    const studentId = objectId()
    const lecturerId = objectId()
    const staffId = objectId()
    const { orgId } = course
    const dataMock = [
      {
        _id: objectId(),
        absentStudentIds: [studentId],
        lecturerComment: null,
        publicationState: 'Published',
        avgNumberOfStars: 2.5,
        description: 'first2',
        createdByAccountId: lecturerId,
        updatedByAccountI: lecturerId,
        courseId,
        orgId,
        createdAt: {
          $date: '2021-08-21T17:00:42.173Z',
        },
        updatedAt: {
          $date: '2021-08-27T12:56:54.959Z',
        },
        startTime: {
          $date: '2020-02-28T17:00:00Z',
        },
        endTime: {
          $date: '2020-02-29T17:00:00Z',
        },
      },
      {
        _id: objectId(),
        absentStudentIds: [],
        lecturerComment: null,
        publicationState: 'Published',
        avgNumberOfStars: 0,
        description: 'first4',
        courseId,
        orgId,
        createdByAccountId: lecturerId,
        updatedByAccountI: lecturerId,
        startTime: {
          $date: '2021-03-28T17:00:00Z',
        },
        endTime: {
          $date: '2021-03-29T17:00:00Z',
        },
        createdAt: {
          $date: '2021-08-22T16:03:08.216Z',
        },
        updatedAt: {
          $date: '2021-08-22T16:03:08.216Z',
        },
      },
      {
        _id: objectId(),
        absentStudentIds: [],
        lecturerComment: null,
        publicationState: 'Published',
        avgNumberOfStars: 4,
        description: 'first3',
        courseId,
        orgId,
        createdByAccountId: lecturerId,
        updatedByAccountI: lecturerId,
        startTime: {
          $date: '2021-02-28T17:00:00Z',
        },
        endTime: {
          $date: '2021-03-01T17:00:00Z',
        },
        createdAt: {
          $date: '2021-08-22T16:02:41.482Z',
        },
        updatedAt: {
          $date: '2021-08-22T16:02:41.482Z',
        },
      },
      {
        _id: objectId(),
        absentStudentIds: [studentId],
        lecturerComment: null,
        publicationState: 'Draft',
        avgNumberOfStars: 0,
        description: 'first1',
        courseId,
        orgId,
        createdByAccountId: lecturerId,
        updatedByAccountI: lecturerId,
        startTime: {
          $date: '2020-02-11T17:00:00Z',
        },
        endTime: {
          $date: '2020-02-14T17:00:00Z',
        },
        createdAt: {
          $date: '2021-08-21T16:55:09.994Z',
        },
        updatedAt: {
          $date: '2021-08-24T14:41:15.682Z',
        },
      },
    ]

    it(`returns an error if course not found`, async () => {
      expect.assertions(1)

      await expect(
        lessonService.findAndPaginateLessons(
          {
            skip: 0,
            limit: 2,
          },
          {
            courseId: objectId(),
            status: LessonsFilterInputStatus.studying,
          },
          studentId,
          course.orgId,
        ),
      ).rejects.toThrowError(`COURSE_DON'T_EXIT`)
    })

    it(`returns an error if account don't have role`, async () => {
      expect.assertions(1)

      jest
        .spyOn(courseService, 'findCourseById')
        .mockResolvedValueOnce(course as ANY)

      jest
        .spyOn(authService, 'getAccountRoles')
        .mockResolvedValueOnce([] as ANY)

      await expect(
        lessonService.findAndPaginateLessons(
          {
            skip: 0,
            limit: 2,
          },
          {
            courseId: objectId(),
            status: LessonsFilterInputStatus.studying,
          },
          studentId,
          course.orgId,
        ),
      ).rejects.toThrowError(`ACCOUNT_DON'T_HAVE_ROLE`)
    })

    it(`returns an error if account don't have permission when academic status`, async () => {
      expect.assertions(1)

      jest
        .spyOn(courseService, 'findCourseById')
        .mockResolvedValueOnce(course as ANY)

      jest
        .spyOn(authService, 'getAccountRoles')
        .mockResolvedValueOnce([{ priority: 4 }] as ANY)

      await expect(
        lessonService.findAndPaginateLessons(
          {
            skip: 0,
            limit: 2,
          },
          {
            courseId: objectId(),
            status: LessonsFilterInputStatus.academic,
          },
          studentId,
          course.orgId,
        ),
      ).rejects.toThrowError(`DON'T_HAVE_PERMISSION`)
    })

    it(`returns an error if account can't manage course when teaching status`, async () => {
      expect.assertions(1)

      jest
        .spyOn(courseService, 'findCourseById')
        .mockResolvedValueOnce(course as ANY)

      jest
        .spyOn(authService, 'getAccountRoles')
        .mockResolvedValueOnce([{ priorit: 4 }] as ANY)

      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(false as ANY)

      await expect(
        lessonService.findAndPaginateLessons(
          {
            skip: 0,
            limit: 2,
          },
          {
            courseId: objectId(),
            status: LessonsFilterInputStatus.teaching,
          },
          lecturerId,
          course.orgId,
        ),
      ).rejects.toThrowError(`ACCOUNT_CAN'T_MANAGE_COURSE`)
    })

    it(`returns an error if student don't exist form course when studying status`, async () => {
      expect.assertions(1)

      jest
        .spyOn(courseService, 'findCourseById')
        .mockResolvedValueOnce({ ...course, studentIds: [objectId()] } as ANY)

      jest
        .spyOn(authService, 'getAccountRoles')
        .mockResolvedValueOnce([{ priorit: 4 }] as ANY)

      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(false as ANY)

      await expect(
        lessonService.findAndPaginateLessons(
          {
            skip: 0,
            limit: 2,
          },
          {
            courseId: objectId(),
            status: LessonsFilterInputStatus.studying,
          },
          lecturerId,
          course.orgId,
        ),
      ).rejects.toThrowError(`STUDENT_DON'T_EXIST_FORM_COURSE`)
    })

    it(`returns a list lesson when academic status`, async () => {
      expect.assertions(1)

      jest
        .spyOn(courseService, 'findCourseById')
        .mockResolvedValueOnce(course as ANY)

      jest
        .spyOn(authService, 'getAccountRoles')
        .mockResolvedValueOnce([
          { priority: 3 },
          { priority: 4 },
          { priority: 2 },
        ] as ANY)

      jest
        .spyOn(lessonService['lessonModel'], 'aggregate')
        .mockResolvedValueOnce(dataMock as ANY)

      const resolveValue = await dataMock.map((element): ANY => {
        return {
          // eslint-disable-next-line no-underscore-dangle
          id: element._id,
          absentStudentIds: element.absentStudentIds,
          lecturerComment: element.lecturerComment,
          publicationState: element.publicationState,
          avgNumberOfStars: element.avgNumberOfStars,
          description: element.description,
          courseId: element.courseId,
          orgId: element.orgId,
          createdByAccountId: element.createdByAccountId,
          updatedByAccountI: element.updatedByAccountI,
          startTime: element.startTime,
          endTime: element.endTime,
          createdAt: element.createdAt,
          updatedAt: element.updatedAt,
        }
      })

      await expect(
        lessonService.findAndPaginateLessons(
          {
            skip: 0,
            limit: 4,
          },
          {
            courseId: objectId(),
            status: LessonsFilterInputStatus.academic,
          },
          staffId,
          course.orgId,
        ),
      ).resolves.toMatchObject({
        count: 4,
        lessons: resolveValue,
      })
    })

    it(`returns a list lesson when teaching status`, async () => {
      expect.assertions(1)

      jest
        .spyOn(courseService, 'findCourseById')
        .mockResolvedValueOnce(course as ANY)

      jest
        .spyOn(authService, 'getAccountRoles')
        .mockResolvedValueOnce([
          { priority: 3 },
          { priority: 4 },
          { priority: 2 },
        ] as ANY)

      jest
        .spyOn(lessonService['lessonModel'], 'aggregate')
        .mockResolvedValueOnce(dataMock as ANY)

      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true as never)

      const resolveValue = await dataMock.map((element): ANY => {
        return {
          // eslint-disable-next-line no-underscore-dangle
          id: element._id,
          absentStudentIds: element.absentStudentIds,
          lecturerComment: element.lecturerComment,
          publicationState: element.publicationState,
          avgNumberOfStars: element.avgNumberOfStars,
          description: element.description,
          courseId: element.courseId,
          orgId: element.orgId,
          createdByAccountId: element.createdByAccountId,
          updatedByAccountI: element.updatedByAccountI,
          startTime: element.startTime,
          endTime: element.endTime,
          createdAt: element.createdAt,
          updatedAt: element.updatedAt,
        }
      })

      await expect(
        lessonService.findAndPaginateLessons(
          {
            skip: 0,
            limit: 4,
          },
          {
            courseId: objectId(),
            status: LessonsFilterInputStatus.teaching,
          },
          staffId,
          course.orgId,
        ),
      ).resolves.toMatchObject({
        count: 4,
        lessons: resolveValue,
      })
    })

    it('returns a list lesson when studying status', async () => {
      expect.assertions(1)

      const courseMock = {
        ...course,
        studentIds: [studentId],
      }
      const studentRoles = 'student'

      jest
        .spyOn(courseService, 'findCourseById')
        .mockResolvedValueOnce(courseMock as ANY)

      jest
        .spyOn(authService, 'getAccountRoles')
        .mockResolvedValueOnce([studentRoles] as ANY)

      jest
        .spyOn(lessonService['lessonModel'], 'aggregate')
        .mockResolvedValueOnce(dataMock.slice(0, 3) as ANY)

      const resolveValue = await dataMock.slice(0, 2).map((element): ANY => {
        return {
          // eslint-disable-next-line no-underscore-dangle
          id: element._id,
          absentStudentIds: element.absentStudentIds,
          lecturerComment: element.lecturerComment,
          publicationState: element.publicationState,
          avgNumberOfStars: element.avgNumberOfStars,
          description: element.description,
          courseId: element.courseId,
          orgId: element.orgId,
          createdByAccountId: element.createdByAccountId,
          updatedByAccountI: element.updatedByAccountI,
          startTime: element.startTime,
          endTime: element.endTime,
          createdAt: element.createdAt,
          updatedAt: element.updatedAt,
        }
      })

      await expect(
        lessonService.findAndPaginateLessons(
          {
            skip: 0,
            limit: 2,
          },
          {
            courseId: course.id,
            status: LessonsFilterInputStatus.studying,
          },
          studentId,
          course.orgId,
        ),
      ).resolves.toMatchObject({
        count: 3,
        lessons: resolveValue,
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
        lessonService.updateLessonById(
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

    it('returns lessons with new data', async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      jest
        .spyOn(courseService['courseModel'], 'findById')
        .mockResolvedValueOnce(course)

      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)

      const lesson = await lessonService.createLesson(objectId(), objectId(), {
        ...createLessonInput,
        startTime: new Date('2021-08-01 12:00'),
        endTime: new Date('2021-08-01 14:00'),
      })

      await expect(
        lessonService.updateLessonById(
          {
            lessonId: lesson.id,
            orgId: lesson.orgId,
            courseId: lesson.courseId,
          },
          {
            description: 'day la buoi 2',
          } as UpdateLessonInput,
          objectId(),
        ),
      ).resolves.toMatchObject({
        description: 'day la buoi 2',
      })
    })

    it('returns lessons with new data classworkMaterialListBeforeClass', async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      jest
        .spyOn(courseService['courseModel'], 'findById')
        .mockResolvedValueOnce(course)

      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)

      const lesson = await lessonService.createLesson(objectId(), objectId(), {
        ...createLessonInput,
        startTime: new Date('2021-08-01 12:00'),
        endTime: new Date('2021-08-01 14:00'),
      })

      const classworkMaterialListBeforeClass = [
        objectId(),
        objectId(),
        objectId(),
      ]

      const updatedLesson = await lessonService.updateLessonById(
        {
          lessonId: lesson.id,
          orgId: lesson.orgId,
          courseId: lesson.courseId,
        },
        {
          classworkMaterialListBeforeClass,
        } as UpdateLessonInput,
        objectId(),
      )

      await expect(
        (async (): Promise<string[]> => {
          return updatedLesson.classworkMaterialListBeforeClass.map(
            (el): string => el.toString(),
          )
        })(),
      ).resolves.toMatchObject(classworkMaterialListBeforeClass)
    })

    it('returns lessons with new data classworkMaterialListAfterClass', async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      jest
        .spyOn(courseService['courseModel'], 'findById')
        .mockResolvedValueOnce(course)

      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)

      const lesson = await lessonService.createLesson(objectId(), objectId(), {
        ...createLessonInput,
        startTime: new Date('2021-08-01 12:00'),
        endTime: new Date('2021-08-01 14:00'),
      })

      const classworkMaterialListAfterClass = [
        objectId(),
        objectId(),
        objectId(),
      ]

      const updatedLesson = await lessonService.updateLessonById(
        {
          lessonId: lesson.id,
          orgId: lesson.orgId,
          courseId: lesson.courseId,
        },
        {
          classworkMaterialListAfterClass,
        } as UpdateLessonInput,
        objectId(),
      )

      await expect(
        (async (): Promise<string[]> => {
          return updatedLesson.classworkMaterialListAfterClass.map(
            (el): string => el.toString(),
          )
        })(),
      ).resolves.toMatchObject(classworkMaterialListAfterClass)
    })

    it('returns lessons with new data classworkMaterialListInClass', async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      jest
        .spyOn(courseService['courseModel'], 'findById')
        .mockResolvedValueOnce(course)

      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)

      const lesson = await lessonService.createLesson(objectId(), objectId(), {
        ...createLessonInput,
        startTime: new Date('2021-08-01 12:00'),
        endTime: new Date('2021-08-01 14:00'),
      })

      const classworkMaterialListInClass = [objectId(), objectId(), objectId()]

      const updatedLesson = await lessonService.updateLessonById(
        {
          lessonId: lesson.id,
          orgId: lesson.orgId,
          courseId: lesson.courseId,
        },
        {
          classworkMaterialListInClass,
        } as UpdateLessonInput,
        objectId(),
      )

      await expect(
        (async (): Promise<string[]> => {
          return updatedLesson.classworkMaterialListInClass.map((el): string =>
            el.toString(),
          )
        })(),
      ).resolves.toMatchObject(classworkMaterialListInClass)
    })

    it('returns lessons with new data classworkAssignmentListAfterClass', async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      jest
        .spyOn(courseService['courseModel'], 'findById')
        .mockResolvedValueOnce(course)

      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)

      const lesson = await lessonService.createLesson(objectId(), objectId(), {
        ...createLessonInput,
        startTime: new Date('2021-08-01 12:00'),
        endTime: new Date('2021-08-01 14:00'),
      })

      const classworkAssignmentListAfterClass = [
        objectId(),
        objectId(),
        objectId(),
      ]

      const updatedLesson = await lessonService.updateLessonById(
        {
          lessonId: lesson.id,
          orgId: lesson.orgId,
          courseId: lesson.courseId,
        },
        {
          classworkAssignmentListAfterClass,
        } as UpdateLessonInput,
        objectId(),
      )

      await expect(
        (async (): Promise<string[]> => {
          return updatedLesson.classworkAssignmentListAfterClass.map(
            (el): string => el.toString(),
          )
        })(),
      ).resolves.toMatchObject(classworkAssignmentListAfterClass)
    })

    it('returns lessons with new data classworkAssignmentListInClass', async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      jest
        .spyOn(courseService['courseModel'], 'findById')
        .mockResolvedValueOnce(course)

      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)

      const lesson = await lessonService.createLesson(objectId(), objectId(), {
        ...createLessonInput,
        startTime: new Date('2021-08-01 12:00'),
        endTime: new Date('2021-08-01 14:00'),
      })

      const classworkAssignmentListInClass = [
        objectId(),
        objectId(),
        objectId(),
      ]

      const updatedLesson = await lessonService.updateLessonById(
        {
          lessonId: lesson.id,
          orgId: lesson.orgId,
          courseId: lesson.courseId,
        },
        {
          classworkAssignmentListInClass,
        } as UpdateLessonInput,
        objectId(),
      )

      await expect(
        (async (): Promise<string[]> => {
          return updatedLesson.classworkAssignmentListInClass.map(
            (el): string => el.toString(),
          )
        })(),
      ).resolves.toMatchObject(classworkAssignmentListInClass)
    })

    it('returns lessons with new data classworkAssignmentListBeforeClass', async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      jest
        .spyOn(courseService['courseModel'], 'findById')
        .mockResolvedValueOnce(course)

      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)

      const lesson = await lessonService.createLesson(objectId(), objectId(), {
        ...createLessonInput,
        startTime: new Date('2021-08-01 12:00'),
        endTime: new Date('2021-08-01 14:00'),
      })

      const classworkAssignmentListBeforeClass = [
        objectId(),
        objectId(),
        objectId(),
      ]

      const updatedLesson = await lessonService.updateLessonById(
        {
          lessonId: lesson.id,
          orgId: lesson.orgId,
          courseId: lesson.courseId,
        },
        {
          classworkAssignmentListBeforeClass,
        } as UpdateLessonInput,
        objectId(),
      )

      await expect(
        (async (): Promise<string[]> => {
          return updatedLesson.classworkAssignmentListBeforeClass.map(
            (el): string => el.toString(),
          )
        })(),
      ).resolves.toMatchObject(classworkAssignmentListBeforeClass)
    })
  })

  describe('addAbsentStudentsToLesson', () => {
    it('throws error if the account has no permissions', async () => {
      expect.assertions(1)

      await expect(
        lessonService.addAbsentStudentsToLesson(
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
        lessonService.addAbsentStudentsToLesson(
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
        .spyOn(courseService['courseModel'], 'findById')
        .mockResolvedValueOnce(course)

      const lesson = await lessonService.createLesson(
        orgId,
        objectId(),
        createLessonInput,
      )

      const id = objectId()

      await expect(
        lessonService.addAbsentStudentsToLesson(
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
        lessonService.addAbsentStudentsToLesson(
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
        .spyOn(courseService['courseModel'], 'findById')
        .mockResolvedValueOnce(course)

      const lesson = await lessonService.createLesson(
        orgId,
        objectId(),
        createLessonInput,
      )

      const addAbsentStudentIds = await lessonService.addAbsentStudentsToLesson(
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
        lessonService.removeAbsentStudentsFromLesson(
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
        lessonService.removeAbsentStudentsFromLesson(
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
        .spyOn(courseService['courseModel'], 'findById')
        .mockResolvedValueOnce(course)

      const lesson = await lessonService.createLesson(
        orgId,
        objectId(),
        createLessonInput,
      )

      const id = objectId()

      await expect(
        lessonService.removeAbsentStudentsFromLesson(
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
        lessonService.removeAbsentStudentsFromLesson(
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
        .spyOn(courseService['courseModel'], 'findById')
        .mockResolvedValueOnce(course)

      const lesson = await lessonService.createLesson(
        orgId,
        objectId(),
        createLessonInput,
      )

      lesson.absentStudentIds.push(accountStudent.id)
      await lesson.save()

      const addAbsentStudentIds =
        await lessonService.removeAbsentStudentsFromLesson(
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

  describe('updateLessonPublicationById', () => {
    it(`returns an error if account can't manage course`, async () => {
      expect.assertions(1)
      const input = {
        lessonId: objectId(),
        publicationState: Publication.Published,
        courseId: objectId(),
      }

      await expect(
        lessonService.updateLessonPublicationById(input, objectId()),
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
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true as never)

      await expect(
        lessonService.updateLessonPublicationById(input, objectId()),
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
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(true as never)

      jest
        .spyOn(lessonService['lessonModel'], 'findByIdAndUpdate')
        .mockResolvedValueOnce(lesson as ANY)

      await expect(
        lessonService.updateLessonPublicationById(input, objectId()),
      ).resolves.toMatchObject(lesson)

      input.publicationState = Publication.Draft

      lesson.publicationState = input.publicationState

      jest
        .spyOn(lessonService['lessonModel'], 'findByIdAndUpdate')
        .mockResolvedValueOnce(lesson as ANY)

      await expect(
        lessonService.updateLessonPublicationById(input, objectId()),
      ).resolves.toMatchObject(lesson)
    })
  })

  describe('findLessonById', () => {
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
        .spyOn(lessonService['lessonModel'], 'findOne')
        .mockResolvedValueOnce(lesson as ANY)

      await expect(
        lessonService.findLessonById(lesson.id, lesson.orgId),
      ).resolves.toMatchObject(lesson)
    })

    it('returns a null if found', async () => {
      expect.assertions(1)

      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true)

      jest
        .spyOn(lessonService['lessonModel'], 'findOne')
        .mockResolvedValueOnce(null as ANY)

      await expect(
        lessonService.findLessonById(objectId(), objectId()),
      ).resolves.toBeNull()
    })
  })

  describe('commentsForTheLessonByLecturer', () => {
    const comment = 'hom nay cac ban hoc rat tot'

    it('throws error if the account has no permissions', async () => {
      expect.assertions(1)

      await expect(
        lessonService.commentsForTheLessonByLecturer(
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
        lessonService.commentsForTheLessonByLecturer(
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
        .spyOn(courseService['courseModel'], 'findById')
        .mockResolvedValueOnce(course)

      const lesson = await lessonService.createLesson(
        orgId,
        objectId(),
        createLessonInput,
      )

      await expect(
        lessonService.commentsForTheLessonByLecturer(
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
})
