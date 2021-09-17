import { forwardRef, Inject } from '@nestjs/common'
import { ReturnModelType, DocumentType, mongoose } from '@typegoose/typegoose'

import { Service, InjectModel, Logger, Publication } from 'core'
import { AccountService } from 'modules/account/account.service'
import { AuthService } from 'modules/auth/auth.service'
import { CourseService } from 'modules/course/course.service'
import { Course } from 'modules/course/models/Course'
import { OrgService } from 'modules/org/org.service'
import { ANY, Nullable, PageOptionsInput } from 'types'

import {
  CommentsForTheLessonByLecturerInput,
  CommentsForTheLessonByLecturerQuery,
  CreateLessonInput,
  GenerateLessonsInput,
  LessonsFilterInput,
  LessonsFilterInputStatus,
  LessonsPayload,
  ListLessons,
  UpdateLessonInput,
  UpdateLessonPublicationByIdInput,
} from './lesson.type'
import { Lesson } from './models/Lesson'

@Service()
export class LessonService {
  private readonly logger = new Logger(LessonService.name)

  constructor(
    @InjectModel(Lesson)
    private readonly lessonModel: ReturnModelType<typeof Lesson>,

    @InjectModel(Course)
    private readonly courseModel: ReturnModelType<typeof Course>,

    @Inject(forwardRef(() => CourseService))
    private readonly courseService: CourseService,

    @Inject(forwardRef(() => OrgService))
    private readonly orgService: OrgService,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,

    @Inject(forwardRef(() => AccountService))
    private readonly accountService: AccountService,
  ) {}

  async createLesson(
    orgId: string,
    createdByAccountId: string,
    createLessonInput: CreateLessonInput,
  ): Promise<DocumentType<Lesson>> {
    const { lessonModel, courseModel } = this
    const { startTime, endTime, description, courseId, publicationState } =
      createLessonInput

    if (!(await this.orgService.validateOrgId(orgId))) {
      throw new Error(`Org ID is invalid`)
    }

    const course = await courseModel.findById(courseId)

    if (!course) {
      throw new Error('THIS_COURSE_DOES_NOT_EXIST')
    }

    if (
      !(await this.authService.canAccountManageCourse(
        createdByAccountId,
        courseId,
      ))
    ) {
      throw new Error(`ACCOUNT_CAN'T_MANAGE_COURSE`)
    }

    const startTimeInput = new Date(startTime)
    const endTimeInput = new Date(endTime)

    if (startTimeInput > endTimeInput) {
      throw new Error('START_TIME_OR_END_TIME_INVALID')
    }

    const lessons = await lessonModel.find({
      orgId,
      courseId,
    })

    const checkLessonDate = lessons.map((lesson) => {
      if (
        (startTimeInput >= new Date(lesson.startTime) &&
          startTimeInput <= new Date(lesson.endTime)) ||
        (endTimeInput >= new Date(lesson.startTime) &&
          endTimeInput <= new Date(lesson.endTime)) ||
        (new Date(lesson.startTime) >= startTimeInput &&
          new Date(lesson.endTime) <= endTimeInput)
      ) {
        return Promise.reject(
          new Error(`THERE_WAS_A_REHEARSAL_CLASS_DURING_THIS_TIME`),
        )
      }

      return lesson
    })

    await Promise.all(checkLessonDate).catch((err) => {
      throw new Error(err)
    })

    const lesson = lessonModel.create({
      createdByAccountId,
      updatedByAccountId: createdByAccountId,
      startTime: startTimeInput,
      endTime: endTimeInput,
      description,
      courseId,
      orgId,
      publicationState,
    })

    return lesson
  }

  async findAndPaginateLessons(
    pageOptions: PageOptionsInput,
    filter: LessonsFilterInput,
    accountId: string,
    orgId: string,
  ): Promise<LessonsPayload> {
    this.logger.log(`[${this.findAndPaginateLessons.name}] finding... `)
    this.logger.verbose({
      pageOptions,
      filter,
      accountId,
      orgId,
    })

    const {
      courseId,
      startTime,
      endTime,
      absentStudentId,
      ratingStar,
      status,
    } = filter
    const { limit, skip } = pageOptions

    const course = await this.courseService.findCourseById(courseId, orgId)

    if (!course) {
      throw new Error(`COURSE_DON'T_EXIT`)
    }

    const accountHasRoles = await this.authService.getAccountRoles(accountId)
    if (!accountHasRoles.length) {
      throw new Error(`ACCOUNT_DON'T_HAVE_ROLE`)
    }

    const pipeline: ANY = [
      {
        $match: {
          orgId: mongoose.Types.ObjectId(orgId),
        },
      },
      {
        $match: {
          courseId: mongoose.Types.ObjectId(courseId),
        },
      },
    ]

    switch (status) {
      case LessonsFilterInputStatus.academic: {
        let hasPermission = false
        const lecturerRole = 4
        accountHasRoles.every((role): boolean => {
          if (role.priority < lecturerRole) {
            hasPermission = true
            return false
          }
          return true
        })

        if (!hasPermission) throw new Error(`DON'T_HAVE_PERMISSION`)
        break
      }

      case LessonsFilterInputStatus.teaching: {
        if (
          !(await this.authService.canAccountManageCourse(accountId, courseId))
        ) {
          throw new Error(`ACCOUNT_CAN'T_MANAGE_COURSE`)
        }
        break
      }

      case LessonsFilterInputStatus.studying: {
        if (course.studentIds.includes(accountId)) {
          pipeline.push({
            $match: {
              publicationState: Publication.Published,
            },
          })
        } else {
          throw new Error(`STUDENT_DON'T_EXIST_FORM_COURSE`)
        }
        break
      }

      default: {
        throw new Error(`STATUS_NOT_FOUND`)
      }
    }

    if (startTime) {
      pipeline.push({
        $match: {
          startTime: {
            $gte: new Date(startTime),
          },
        },
      })
    }

    if (endTime) {
      pipeline.push({
        $match: {
          endTime: {
            $lte: new Date(endTime),
          },
        },
      })
    }

    if (absentStudentId) {
      pipeline.push({
        $match: {
          $expr: {
            $in: [
              mongoose.Types.ObjectId(absentStudentId),
              '$absentStudentIds',
            ],
          },
        },
      })
    }

    if (ratingStar !== null) {
      pipeline.push({
        $match: {
          $expr: {
            $eq: [{ $round: ['$avgNumberOfStars', 0] }, ratingStar],
          },
        },
      })
    }

    pipeline.push({
      $sort: { startTime: 1 },
    })

    let lessons = await this.lessonModel.aggregate(pipeline)

    const count = lessons.length

    lessons = lessons.slice(skip, skip + limit >= count ? count : skip + limit)

    this.logger.log(`[${this.findAndPaginateLessons.name}] done ! `)
    this.logger.verbose({ lessons, count })

    const lessonsPayload = new LessonsPayload()

    lessonsPayload.lessons = await lessons.map((el): Lesson => {
      const lesson = {
        // eslint-disable-next-line no-underscore-dangle
        id: el._id,
        absentStudentIds: el.absentStudentIds,
        lecturerComment: el.lecturerComment,
        publicationState: el.publicationState,
        avgNumberOfStars: el.avgNumberOfStars,
        createdByAccountId: el.createdByAccountId,
        updatedByAccountI: el.updatedByAccountI,
        startTime: el.startTime,
        endTime: el.endTime,
        description: el.description,
        courseId: el.courseId,
        orgId: el.orgId,
        createdAt: el.createdAt,
        updatedAt: el.updatedAt,
      } as ANY
      return lesson
    })
    lessonsPayload.count = count

    return lessonsPayload
  }

  async updateLessonById(
    query: {
      lessonId: string
      orgId: string
      courseId: string
    },
    updateInput: UpdateLessonInput,
    updatedByAccountId: string,
  ): Promise<DocumentType<Lesson>> {
    this.logger.log(`[${this.updateLessonById.name}] updating...`)
    this.logger.log({
      query,
      updateInput,
      updatedByAccountId,
    })

    const { lessonId, orgId, courseId } = query
    const {
      description,
      publicationState,
      absentStudentIds,
      classworkMaterialListBeforeClass,
      classworkMaterialListInClass,
      classworkMaterialListAfterClass,
      classworkAssignmentListBeforeClass,
      classworkAssignmentListInClass,
      classworkAssignmentListAfterClass,
    } = updateInput
    const { lessonModel } = this

    if (
      !(await this.authService.canAccountManageCourse(
        updatedByAccountId,
        courseId,
      ))
    ) {
      throw new Error(`ACCOUNT_CAN'T_MANAGE_COURSE`)
    }

    const lesson = await lessonModel.findOne({
      _id: lessonId,
      orgId,
      courseId,
    })

    if (!lesson) {
      throw new Error('Lesson not found')
    }

    if (absentStudentIds) {
      lesson.absentStudentIds = absentStudentIds
    }

    if (description) {
      lesson.description = description
    }

    if (publicationState) {
      lesson.publicationState = publicationState
    }

    if (classworkMaterialListBeforeClass) {
      lesson.classworkMaterialListBeforeClass = classworkMaterialListBeforeClass
    }

    if (classworkMaterialListInClass) {
      lesson.classworkMaterialListInClass = classworkMaterialListInClass
    }

    if (classworkMaterialListAfterClass) {
      lesson.classworkMaterialListAfterClass = classworkMaterialListAfterClass
    }

    if (classworkAssignmentListBeforeClass) {
      lesson.classworkAssignmentListBeforeClass =
        classworkAssignmentListBeforeClass
    }

    if (classworkAssignmentListInClass) {
      lesson.classworkAssignmentListInClass = classworkAssignmentListInClass
    }

    if (classworkAssignmentListAfterClass) {
      lesson.classworkAssignmentListAfterClass =
        classworkAssignmentListAfterClass
    }

    lesson.updatedByAccountId = updatedByAccountId

    const update = await lesson.save()

    this.logger.log(`[${this.updateLessonById.name}] updating...`)
    this.logger.verbose(update)

    return update
  }

  async addAbsentStudentsToLesson(
    query: {
      lessonId: string
      orgId: string
      courseId: string
    },
    absentStudentIds: string[],
    updatedByAccountId: string,
  ): Promise<DocumentType<Lesson>> {
    const { lessonId, orgId, courseId } = query
    const { lessonModel } = this

    if (
      !(await this.authService.canAccountManageCourse(
        updatedByAccountId,
        courseId,
      ))
    ) {
      throw new Error(`ACCOUNT_CAN'T_MANAGE_COURSE`)
    }

    const lesson = await lessonModel.findOne({
      _id: lessonId,
      orgId,
      courseId,
    })

    if (!lesson) {
      throw new Error('Lesson not found')
    }

    const studentIds = absentStudentIds.map(async (id) => {
      const account = await this.accountService.findOneAccount({
        id,
        orgId,
      })

      if (!account) {
        return Promise.reject(new Error(`ID ${id} is not found`))
      }
      if (!account?.roles.includes('student')) {
        return Promise.reject(
          new Error(`${account?.displayName} isn't a student`),
        )
      }
      return lessonId
    })

    await Promise.all(studentIds).catch((err) => {
      throw new Error(err)
    })

    absentStudentIds.forEach((id) => {
      if (!lesson.absentStudentIds.includes(id)) {
        lesson.absentStudentIds.push(id)
      }
    })
    lesson.updatedByAccountId = updatedByAccountId

    const update = await lesson.save()
    return update
  }

  async removeAbsentStudentsFromLesson(
    query: {
      lessonId: string
      orgId: string
      courseId: string
    },
    absentStudentIds: string[],
    updatedByAccountId: string,
  ): Promise<DocumentType<Lesson>> {
    const { lessonId, orgId, courseId } = query
    const { lessonModel } = this

    if (
      !(await this.authService.canAccountManageCourse(
        updatedByAccountId,
        courseId,
      ))
    ) {
      throw new Error(`ACCOUNT_CAN'T_MANAGE_COURSE`)
    }

    const lesson = await lessonModel.findOne({
      _id: lessonId,
      orgId,
      courseId,
    })

    if (!lesson) {
      throw new Error('Lesson not found')
    }

    const studentIds = absentStudentIds.map(async (studentId) => {
      const account = await this.accountService.findOneAccount({
        id: studentId,
        orgId,
      })

      if (!account) {
        return Promise.reject(new Error(`ID ${studentId} is not found`))
      }
      if (!account?.roles.includes('student')) {
        return Promise.reject(
          new Error(`${account?.displayName} isn't a student`),
        )
      }

      return lessonId
    })

    await Promise.all(studentIds).catch((err) => {
      throw new Error(err)
    })

    absentStudentIds.map((id) =>
      lesson.absentStudentIds.splice(lesson.absentStudentIds.indexOf(id), 1),
    )
    lesson.updatedByAccountId = updatedByAccountId

    const update = await lesson.save()
    return update
  }

  async findLessonById(
    lessonId: string,
    orgId: string,
  ): Promise<Nullable<DocumentType<Lesson>>> {
    return this.lessonModel.findOne({ _id: lessonId, orgId })
  }

  async commentsForTheLessonByLecturer(
    orgId: string,
    accountId: string,
    query: CommentsForTheLessonByLecturerQuery,
    commentsForTheLessonByLecturerInput: CommentsForTheLessonByLecturerInput,
  ): Promise<DocumentType<Lesson>> {
    const { lessonId, courseId } = query
    const { comment } = commentsForTheLessonByLecturerInput
    const { lessonModel } = this

    if (!(await this.authService.canAccountManageCourse(accountId, courseId))) {
      throw new Error(`ACCOUNT_CAN'T_MANAGE_COURSE`)
    }

    const lesson = await lessonModel.findOne({
      _id: lessonId,
      orgId,
      courseId,
    })

    if (!lesson) {
      throw new Error('Lesson not found')
    }

    if (!comment) {
      return lesson
    }

    lesson.lecturerComment = comment
    lesson.updatedByAccountId = accountId

    const update = await lesson.save()
    return update
  }

  async updateLessonPublicationById(
    input: UpdateLessonPublicationByIdInput,
    accountId: string,
  ): Promise<DocumentType<Lesson>> {
    this.logger.log(`[${this.updateLessonPublicationById.name}] updating ...`)
    this.logger.verbose({ input, accountId })

    const { lessonId, publicationState, courseId } = input

    if (!(await this.authService.canAccountManageCourse(accountId, courseId))) {
      throw new Error(`ACCOUNT_CAN'T_MANAGE_COURSE`)
    }

    const lesson = await this.lessonModel.findByIdAndUpdate(
      lessonId,
      {
        $set: {
          publicationState,
          updatedByAccountId: accountId,
        },
      },
      { new: true },
    )

    if (!lesson) {
      throw new Error('Lesson not found')
    }

    this.logger.log(`[${this.updateLessonPublicationById.name}] update`)
    this.logger.verbose(lesson)

    return lesson
  }

  async generateLessons(
    orgId: string,
    courseId: string,
    createdByAccountId: string,
    generateLessonsInput: GenerateLessonsInput,
  ): Promise<ListLessons> {
    this.logger.log(`[${this.generateLessons.name}] generating ...`)
    this.logger.verbose({
      orgId,
      courseId,
      createdByAccountId,
      generateLessonsInput,
    })

    const { lessonModel, courseModel } = this

    const { courseStartDate, totalNumberOfLessons, daysOfTheWeek } =
      generateLessonsInput

    if (!(await this.orgService.validateOrgId(orgId))) {
      throw new Error(`Org ID is invalid`)
    }

    const course = await courseModel.findById(courseId)

    if (!course) {
      throw new Error('THIS_COURSE_DOES_NOT_EXIST')
    }

    if (
      !(await this.authService.canAccountManageCourse(
        createdByAccountId,
        courseId,
      ))
    ) {
      throw new Error(`ACCOUNT_CAN'T_MANAGE_COURSE`)
    }

    const currentDate = new Date()

    const checkTime = daysOfTheWeek.map((day) => {
      const startTimeInput = new Date(
        `${currentDate.getFullYear()}-${
          currentDate.getMonth() + 1
        }-${currentDate.getDate()} ${day.startTime}`,
      )
      const endTimeInput = new Date(
        `${currentDate.getFullYear()}-${
          currentDate.getMonth() + 1
        }-${currentDate.getDate()} ${day.endTime}`,
      )

      if (endTimeInput.getTime() < startTimeInput.getTime()) {
        return Promise.reject(
          new Error(`PLEASE_CHECK_START_AND_END_TIMES_OF_THE_WEEKDAYS`),
        )
      }
      return day
    })

    await Promise.all(checkTime).catch((err) => {
      throw new Error(err)
    })

    // generate
    const days: ANY = []
    const date = new Date(courseStartDate)

    while (days.length < totalNumberOfLessons) {
      this.logger.log(`While days.length === totalNumberOfLessons`)
      this.logger.verbose({
        lengthDays: days.length,
        totalNumberOfLessons,
      })
      const daysFilter = daysOfTheWeek.filter((day) => {
        return day.dayOfWeek === date.getDay()
      })
      if (daysFilter.length > 0) {
        const startTime = new Date(
          `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${
            daysFilter[0].startTime
          }`,
        )
        const endTime = new Date(
          `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${
            daysFilter[0].endTime
          }`,
        )

        this.logger.verbose({
          date,
          startTime,
          endTime,
        })

        const timeOfDay = {
          startTime,
          endTime,
        }
        days.push(timeOfDay)

        const createLessonInput: CreateLessonInput = {
          ...timeOfDay,
          courseId,
          description: '',
          publicationState: Publication.Draft,
        }

        try {
          // eslint-disable-next-line no-await-in-loop
          await this.createLesson(orgId, createdByAccountId, createLessonInput)
        } catch (err) {
          throw new Error(err)
        }
      }
      date.setDate(date.getDate() + 1)
    }

    this.logger.verbose({ days, length: days.length })

    const lessons = await lessonModel.find({ orgId, courseId })
    const count = await lessonModel.countDocuments({ orgId, courseId })

    this.logger.verbose({ lessons, count })

    const results: ListLessons = {
      lessons,
      count,
    }

    return results
  }
}
