import { TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { Publication } from 'core'
import { objectId } from 'core/utils/db'
import { createTestingModule, initTestDb } from 'core/utils/testing'
import { AcademicService } from 'modules/academic/academic.service'
import { AccountService } from 'modules/account/account.service'
import { AuthService } from 'modules/auth/auth.service'
import { CourseService } from 'modules/course/course.service'
import { OrgService } from 'modules/org/org.service'
import { OrgOfficeService } from 'modules/orgOffice/orgOffice.service'
import { ANY } from 'types'

import { LessonService } from './lesson.service'
import {
  DayOfWeek,
  GenerateLessonsInput,
  LessonsFilterInputStatus,
  UpdateLessonInput,
  UpdateLessonTimeOptions,
} from './lesson.type'
import { Lesson } from './models/Lesson'

describe('lesson.service', () => {
  let module: TestingModule
  let orgService: OrgService
  let authService: AuthService
  let lessonService: LessonService
  let accountService: AccountService
  let courseService: CourseService
  let academicService: AcademicService
  let orgOfficeService: OrgOfficeService
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
    academicService = module.get<AcademicService>(AcademicService)
    orgOfficeService = module.get<OrgOfficeService>(OrgOfficeService)
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
    startDate: new Date('2021-08-15'),
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

    it('throws error if course not exist', async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      await expect(
        lessonService.createLesson(objectId(), objectId(), createLessonInput),
      ).rejects.toThrowError(`THIS_COURSE_DOES_NOT_EXIST`)
    })

    it('throws error if the account has no permissions', async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(lessonService['courseModel'], 'findById')
        .mockResolvedValueOnce(true as never)

      await expect(
        lessonService.createLesson(objectId(), objectId(), createLessonInput),
      ).rejects.toThrowError(`ACCOUNT_CAN'T_MANAGE_COURSE`)
    })

    it('throws error if startTime is smaller than currentDate', async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true)

      const date = new Date()

      jest
        .spyOn(courseService['courseModel'], 'findById')
        .mockResolvedValueOnce({
          ...course,
          startDate: new Date().setDate(date.getDate() + 5),
        })

      const createLesson: ANY = {
        ...createLessonInput,
        startTime: new Date('2021-09-10 10:30'),
        endTime: new Date('2021-09-10 12:30'),
      }

      await expect(
        lessonService.createLesson(objectId(), objectId(), createLesson),
      ).rejects.toThrowError(
        `START_TIME_OF_THE_LESSON_CAN'T_BE_LESS_THAN_CURRENT_TIME`,
      )
    })

    it('throws error if startTime is smaller than startDate of the course', async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true)

      const date = new Date()

      jest
        .spyOn(courseService['courseModel'], 'findById')
        .mockResolvedValueOnce({
          ...course,
          startDate: new Date().setDate(date.getDate() + 5),
        })

      const createLesson: ANY = {
        ...createLessonInput,
        startTime: date.setDate(date.getDate() + 1),
        endTime: date.setDate(date.getDate() + 1),
      }

      await expect(
        lessonService.createLesson(objectId(), objectId(), createLesson),
      ).rejects.toThrowError(
        `START_TIME_OF_THE_LESSON_CAN'T_BE_LESS_THAN_START_DATE_OF_THE_COURSE`,
      )
    })

    it('throws error if startTime and endDate invalid', async () => {
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

      const date = new Date()

      const createLesson: ANY = {
        ...createLessonInput,
        startTime: date.setDate(date.getDate() + 1),
        endTime: date.setDate(date.getDate() - 4),
      }

      await expect(
        lessonService.createLesson(objectId(), objectId(), createLesson),
      ).rejects.toThrowError('START_TIME_OR_END_TIME_INVALID')
    })

    it('throws error if startTime and endTime coincide with other lessons', async () => {
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

      const date = new Date()

      const createLesson: ANY = {
        ...createLessonInput,
        startTime: new Date().setHours(date.getHours() + 2),
        endTime: new Date().setHours(date.getHours() + 4),
      }

      const lessons: ANY = [
        {
          ...createLesson,
        },
      ]

      jest
        .spyOn(lessonService['lessonModel'], 'find')
        .mockResolvedValueOnce(lessons)
        .mockResolvedValueOnce(lessons)
        .mockResolvedValueOnce(lessons)
        .mockResolvedValueOnce(lessons)

      createLesson.startTime = new Date().setHours(date.getHours() + 1)
      createLesson.endTime = new Date().setHours(date.getHours() + 2)

      await expect(
        lessonService.createLesson(objectId(), objectId(), createLesson),
      ).rejects.toThrowError('THERE_WAS_A_REHEARSAL_CLASS_DURING_THIS_TIME')

      createLesson.startTime = new Date().setHours(date.getHours() + 1)
      createLesson.endTime = new Date().setHours(date.getHours() + 5)

      await expect(
        lessonService.createLesson(objectId(), objectId(), createLesson),
      ).rejects.toThrowError('THERE_WAS_A_REHEARSAL_CLASS_DURING_THIS_TIME')

      createLesson.startTime = new Date().setHours(date.getHours() + 2)
      createLesson.endTime = new Date().setHours(date.getHours() + 6)

      await expect(
        lessonService.createLesson(objectId(), objectId(), createLesson),
      ).rejects.toThrowError('THERE_WAS_A_REHEARSAL_CLASS_DURING_THIS_TIME')

      createLesson.startTime = new Date().setHours(date.getHours() + 1)
      createLesson.endTime = new Date().setHours(date.getHours() + 4)

      await expect(
        lessonService.createLesson(objectId(), objectId(), createLesson),
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

      const createLesson: ANY = {
        ...createLessonInput,
      }

      const lessons: ANY = [
        {
          ...createLesson,
        },
      ]

      jest
        .spyOn(lessonService['lessonModel'], 'find')
        .mockResolvedValueOnce(lessons)

      const date = new Date()

      createLesson.startTime = date.setDate(date.getDate() + 1)
      createLesson.endTime = date.setDate(date.getDate() + 1)

      const expectLesson = await lessonService.createLesson(
        objectId(),
        objectId(),
        createLesson,
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
        startTime: new Date(createLesson.startTime),
        endTime: new Date(createLesson.endTime),
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
    it('throws error if course not found', async () => {
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
      ).rejects.toThrowError('Course not found')
    })

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

      jest
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(course)

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

    it('throws error if startTime is smaller than currentTime', async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      jest
        .spyOn(courseService['courseModel'], 'findById')
        .mockResolvedValueOnce(course)

      jest
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(course)

      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)

      const date = new Date()

      const lesson = await lessonService.createLesson(objectId(), objectId(), {
        ...createLessonInput,
        startTime: date.setDate(date.getDate() + 1),
        endTime: date.setDate(date.getDate() + 1),
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
            startTime: new Date('2021-08-16 12:00'),
            options: UpdateLessonTimeOptions.ArbitraryChange,
          } as UpdateLessonInput,
          objectId(),
        ),
      ).rejects.toThrowError(
        `START_TIME_OF_THE_LESSON_CAN'T_BE_LESS_THAN_CURRENT_TIME`,
      )
    })

    it('throws error if startTime is smaller than startDate of the course', async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      jest
        .spyOn(courseService['courseModel'], 'findById')
        .mockResolvedValueOnce(course)

      const date = new Date()

      jest
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce({
          ...course,
          startDate: new Date().setDate(date.getDate() + 5),
        })

      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)

      const lesson = await lessonService.createLesson(objectId(), objectId(), {
        ...createLessonInput,
        startTime: date.setDate(date.getDate() + 1),
        endTime: date.setDate(date.getDate() + 1),
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
            startTime: new Date(new Date().setDate(date.getDate() + 1)),
            endTime: new Date(new Date().setDate(date.getDate() + 2)),
            options: UpdateLessonTimeOptions.ArbitraryChange,
          } as UpdateLessonInput,
          objectId(),
        ),
      ).rejects.toThrowError(
        `START_TIME_OF_THE_LESSON_CAN'T_BE_LESS_THAN_START_DATE_OF_THE_COURSE`,
      )
    })

    it('returns lessons with new data', async () => {
      expect.assertions(2)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(true as never)

      jest
        .spyOn(courseService['courseModel'], 'findById')
        .mockResolvedValueOnce(course)
        .mockResolvedValueOnce(course)

      jest
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(course)
        .mockResolvedValueOnce(course)

      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)

      const date = new Date()

      const lesson = await lessonService.createLesson(objectId(), objectId(), {
        ...createLessonInput,
        startTime: date.setDate(date.getDate() + 1),
        endTime: date.setDate(date.getDate() + 1),
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

      await expect(
        lessonService.updateLessonById(
          {
            lessonId: lesson.id,
            orgId: lesson.orgId,
            courseId: lesson.courseId,
          },
          {
            description: 'day la buoi 2',
            startTime: new Date(date.setDate(date.getDate() + 1)),
            endTime: new Date(new Date().setDate(date.getDate() + 2)),
            options: UpdateLessonTimeOptions.ArbitraryChange,
          } as UpdateLessonInput,
          objectId(),
        ),
      ).resolves.toMatchObject({
        description: 'day la buoi 2',
        startTime: date,
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
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(course)

      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)

      const date = new Date()

      const lesson = await lessonService.createLesson(objectId(), objectId(), {
        ...createLessonInput,
        startTime: date.setDate(date.getDate() + 1),
        endTime: date.setDate(date.getDate() + 1),
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
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(course)

      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)

      const date = new Date()

      const lesson = await lessonService.createLesson(objectId(), objectId(), {
        ...createLessonInput,
        startTime: date.setDate(date.getDate() + 1),
        endTime: date.setDate(date.getDate() + 1),
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
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(course)

      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)

      const date = new Date()

      const lesson = await lessonService.createLesson(objectId(), objectId(), {
        ...createLessonInput,
        startTime: date.setDate(date.getDate() + 1),
        endTime: date.setDate(date.getDate() + 1),
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
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(course)

      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)

      const date = new Date()

      const lesson = await lessonService.createLesson(objectId(), objectId(), {
        ...createLessonInput,
        startTime: date.setDate(date.getDate() + 1),
        endTime: date.setDate(date.getDate() + 1),
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
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(course)

      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)

      const date = new Date()

      const lesson = await lessonService.createLesson(objectId(), objectId(), {
        ...createLessonInput,
        startTime: date.setDate(date.getDate() + 1),
        endTime: date.setDate(date.getDate() + 1),
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
        .spyOn(courseService['courseModel'], 'findOne')
        .mockResolvedValueOnce(course)

      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)

      const date = new Date()

      const lesson = await lessonService.createLesson(objectId(), objectId(), {
        ...createLessonInput,
        startTime: date.setDate(date.getDate() + 1),
        endTime: date.setDate(date.getDate() + 1),
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

      const date = new Date()

      const lesson = await lessonService.createLesson(orgId, objectId(), {
        ...createLessonInput,
        startTime: date.setDate(date.getDate() + 1),
        endTime: date.setDate(date.getDate() + 1),
      })

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

      const date = new Date()

      const lesson = await lessonService.createLesson(orgId, objectId(), {
        ...createLessonInput,
        startTime: date.setDate(date.getDate() + 1),
        endTime: date.setDate(date.getDate() + 1),
      })

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

      const date = new Date()

      const lesson = await lessonService.createLesson(orgId, objectId(), {
        ...createLessonInput,
        startTime: date.setDate(date.getDate() + 1),
        endTime: date.setDate(date.getDate() + 1),
      })

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

      const date = new Date()

      const lesson = await lessonService.createLesson(orgId, objectId(), {
        ...createLessonInput,
        startTime: date.setDate(date.getDate() + 1),
        endTime: date.setDate(date.getDate() + 1),
      })

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

      const date = new Date()

      const lesson = await lessonService.createLesson(orgId, objectId(), {
        ...createLessonInput,
        startTime: date.setDate(date.getDate() + 1),
        endTime: date.setDate(date.getDate() + 1),
      })

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

  describe('generateLessons', () => {
    const date = new Date()
    const generateLessonsInput: GenerateLessonsInput = {
      courseStartDate: new Date(new Date().setDate(date.getDate() + 5)),
      totalNumberOfLessons: 3,
      daysOfTheWeek: [
        {
          dayOfWeek: DayOfWeek.Monday, // Monday
          startTime: '12:30',
          endTime: '14:00',
        },
        {
          dayOfWeek: DayOfWeek.Wednesday, // Wednesday
          startTime: '14:30',
          endTime: '16:00',
        },
        {
          dayOfWeek: DayOfWeek.Friday, // Friday
          startTime: '17:30',
          endTime: '19:00',
        },
      ],
    }

    it('throws error if org invalid', async () => {
      expect.assertions(1)

      await expect(
        lessonService.generateLessons(
          objectId(),
          objectId(),
          objectId(),
          generateLessonsInput,
        ),
      ).rejects.toThrowError('Org ID is invalid')
    })

    it('throws error if course not found', async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)

      await expect(
        lessonService.generateLessons(
          objectId(),
          objectId(),
          objectId(),
          generateLessonsInput,
        ),
      ).rejects.toThrowError(`THIS_COURSE_DOES_NOT_EXIST`)
    })

    it('throws error if startTime and endTime invalid', async () => {
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

      await expect(
        lessonService.generateLessons(objectId(), objectId(), objectId(), {
          ...generateLessonsInput,
          daysOfTheWeek: [
            {
              dayOfWeek: DayOfWeek.Monday, // Monday
              startTime: '12:30',
              endTime: '09:00',
            },
            {
              dayOfWeek: DayOfWeek.Wednesday, // Wednesday
              startTime: '14:30',
              endTime: '16:00',
            },
            {
              dayOfWeek: DayOfWeek.Friday, // Friday
              startTime: '17:30',
              endTime: '19:00',
            },
          ],
        }),
      ).rejects.toThrowError('PLEASE_CHECK_START_AND_END_TIMES_OF_THE_WEEKDAYS')
    })

    it('returns a list of lessons', async () => {
      expect.assertions(1)

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
        .mockResolvedValueOnce({
          ...course,
          startDate: new Date().setDate(date.getDate() + 5),
        })
        .mockResolvedValueOnce({
          ...course,
          startDate: new Date().setDate(date.getDate() + 5),
        })
        .mockResolvedValueOnce({
          ...course,
          startDate: new Date().setDate(date.getDate() + 5),
        })
        .mockResolvedValueOnce({
          ...course,
          startDate: new Date().setDate(date.getDate() + 5),
        })

      const arrayDateTimeOfTheLessons =
        await lessonService.generateArrayDateTimeOfTheLessons(
          generateLessonsInput,
        )

      await expect(
        lessonService.generateLessons(
          objectId(),
          objectId(),
          objectId(),
          generateLessonsInput,
        ),
      ).resolves.toMatchObject({
        lessons: [
          {
            startTime: arrayDateTimeOfTheLessons[0].startTime,
            endTime: arrayDateTimeOfTheLessons[0].endTime,
            description: 'Tiêu đề',
          },
          {
            startTime: arrayDateTimeOfTheLessons[1].startTime,
            endTime: arrayDateTimeOfTheLessons[1].endTime,
            description: 'Tiêu đề',
          },
          {
            startTime: arrayDateTimeOfTheLessons[2].startTime,
            endTime: arrayDateTimeOfTheLessons[2].endTime,
            description: 'Tiêu đề',
          },
        ],
        count: generateLessonsInput.totalNumberOfLessons,
      })
    })
  })

  describe('generateArrayDateTimeOfTheLessons', () => {
    const generateLessonsInput: GenerateLessonsInput = {
      courseStartDate: course.startDate,
      totalNumberOfLessons: 3,
      daysOfTheWeek: [
        {
          dayOfWeek: DayOfWeek.Monday, // Monday
          startTime: '12:30',
          endTime: '14:00',
        },
        {
          dayOfWeek: DayOfWeek.Wednesday, // Wednesday
          startTime: '14:30',
          endTime: '16:00',
        },
        {
          dayOfWeek: DayOfWeek.Friday, // Friday
          startTime: '17:30',
          endTime: '19:00',
        },
      ],
    }

    it('throws error if startTime and endTime invalid', async () => {
      expect.assertions(1)

      const input = {
        ...generateLessonsInput,
        daysOfTheWeek: [
          {
            dayOfWeek: DayOfWeek.Monday, // Monday
            startTime: '12:30',
            endTime: '09:00',
          },
          {
            dayOfWeek: DayOfWeek.Wednesday, // Wednesday
            startTime: '14:30',
            endTime: '16:00',
          },
          {
            dayOfWeek: DayOfWeek.Friday, // Friday
            startTime: '17:30',
            endTime: '19:00',
          },
        ],
      }

      jest
        .spyOn(courseService['courseModel'], 'findById')
        .mockResolvedValueOnce(course)

      await expect(
        lessonService.generateArrayDateTimeOfTheLessons(input),
      ).rejects.toThrowError('PLEASE_CHECK_START_AND_END_TIMES_OF_THE_WEEKDAYS')
    })

    it('returns a list date time', async () => {
      expect.assertions(1)

      await expect(
        lessonService.generateArrayDateTimeOfTheLessons(generateLessonsInput),
      ).resolves.toMatchObject([
        {
          startTime: new Date('2021-08-16 12:30'),
          endTime: new Date('2021-08-16 14:00'),
        },
        {
          startTime: new Date('2021-08-18 14:30'),
          endTime: new Date('2021-08-18 16:00'),
        },
        {
          startTime: new Date('2021-08-20 17:30'),
          endTime: new Date('2021-08-20 19:00'),
        },
      ])
    })
  })

  describe('addLessonToCourse', () => {
    it('throws error if course not exist', async () => {
      expect.assertions(1)

      jest
        .spyOn(orgService, 'validateOrgId')
        .mockResolvedValueOnce(true as never)
      jest
        .spyOn(authService, 'canAccountManageCourse')
        .mockResolvedValueOnce(true)

      await expect(
        lessonService.addLessonToCourse(
          objectId(),
          objectId(),
          createLessonInput,
        ),
      ).rejects.toThrowError('THIS_COURSE_DOES_NOT_EXIST')
    })

    it('returns a lesson', async () => {
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

      const courseData = await courseService.createCourse(creatorId, orgId, {
        academicSubjectId: objectId(),
        orgOfficeId: objectId(),
        code: 'NodeJS-12',
        name: 'Node Js Thang 12',
        startDate: new Date(),
        tuitionFee: 5000000,
        lecturerIds: [],
        daysOfTheWeek: [],
        totalNumberOfLessons: 5,
      })

      const lesson: ANY = {
        ...createLessonInput,
        courseId: courseData.id,
        startTime: new Date('2021-08-20 07:00'),
        endTime: new Date('2021-08-20 08:30'),
      }

      jest.spyOn(lessonService, 'createLesson').mockResolvedValueOnce(lesson)

      jest
        .spyOn(courseService['courseModel'], 'findById')
        .mockResolvedValueOnce(courseData)
        .mockResolvedValueOnce(courseData)

      const expectLesson = await lessonService.addLessonToCourse(
        objectId(),
        objectId(),
        lesson,
      )

      const resultForExpectLesson = {
        courseId: expectLesson.courseId,
        description: expectLesson.description,
        startTime: expectLesson.startTime,
        endTime: expectLesson.endTime,
        publicationState: expectLesson.publicationState,
      }

      const data = {
        courseId: courseData.id,
        description: 'Day la buoi 1',
        startTime: lesson.startTime,
        endTime: lesson.endTime,
        publicationState: 'Published',
      }

      let result = false
      if (
        JSON.stringify(resultForExpectLesson) === JSON.stringify(data) &&
        courseData.totalNumberOfLessons === 6
      ) {
        result = true
      }

      expect(result).toBeTruthy()
    })
  })
})
