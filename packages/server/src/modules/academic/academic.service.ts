import { forwardRef, Inject } from '@nestjs/common'
import { DocumentType, mongoose, ReturnModelType } from '@typegoose/typegoose'
import { Error, Promise } from 'mongoose'

import { InjectModel, Logger, Publication, Service } from 'core'
import { normalizeCodeField, removeExtraSpaces } from 'core/utils/string'
import { AccountService } from 'modules/account/account.service'
import { AuthService } from 'modules/auth/auth.service'
import { Permission } from 'modules/auth/models'
import { ClassworkService } from 'modules/classwork/classwork.service'
import {
  AvgGradeOfClassworkByCourse,
  AvgGradeOfClassworkByCourseOptionInput,
} from 'modules/classwork/classwork.type'
import { ClassworkAssignment } from 'modules/classwork/models/ClassworkAssignment'
import { OrgService } from 'modules/org/org.service'
import { OrgOfficeService } from 'modules/orgOffice/orgOffice.service'

import { ANY, Nullable, PageOptionsInput } from '../../types'

import {
  CommentsForTheLessonByLecturerInput,
  CommentsForTheLessonByLecturerQuery,
  CreateCourseInput,
  CreateLessonInput,
  LessonsFilterInput,
  LessonsFilterInputStatus,
  LessonsPayload,
  UpdateLessonInput,
  UpdateLessonPublicationByIdInput,
} from './academic.type'
import { AcademicSubject } from './models/AcademicSubject'
import { Course } from './models/Course'
import { Lesson } from './models/Lesson'

@Service()
export class AcademicService {
  private readonly logger = new Logger(AcademicService.name)

  constructor(
    @InjectModel(AcademicSubject)
    private readonly academicSubjectModel: ReturnModelType<
      typeof AcademicSubject
    >,

    @InjectModel(ClassworkAssignment)
    private readonly classworkAssignmentModel: ReturnModelType<
      typeof ClassworkAssignment
    >,

    @InjectModel(Course)
    private readonly courseModel: ReturnModelType<typeof Course>,

    @InjectModel(Lesson)
    private readonly lessonModel: ReturnModelType<typeof Lesson>,

    @Inject(forwardRef(() => OrgService))
    private readonly orgService: OrgService,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,

    @Inject(forwardRef(() => AccountService))
    private readonly accountService: AccountService,

    @Inject(forwardRef(() => OrgOfficeService))
    private readonly orgOfficeService: OrgOfficeService,

    @Inject(forwardRef(() => ClassworkService))
    private readonly classworkService: ClassworkService,
  ) {}

  async findAcademicSubjectByCode(
    $code: string,
    orgId?: string,
  ): Promise<DocumentType<AcademicSubject> | null> {
    const code = normalizeCodeField($code)
    const query = orgId ? { code, orgId } : { code }

    return this.academicSubjectModel.findOne(query)
  }

  async existsAcademicSubjectByCode(
    $code: string,
    orgId?: string,
  ): Promise<boolean> {
    const code = normalizeCodeField($code)
    const query = orgId ? { code, orgId } : { code }

    return this.academicSubjectModel.exists(query)
  }

  async createAcademicSubject(academicSubjectInput: {
    orgId: string
    code: string
    name: string
    description: string
    createdByAccountId: string
    imageFileId: string
  }): Promise<DocumentType<AcademicSubject>> {
    this.logger.log(
      `[${this.createAcademicSubject.name}] Creating academic subject`,
    )
    this.logger.verbose(academicSubjectInput)

    const {
      orgId,
      code: $code,
      name,
      description,
      createdByAccountId,
      imageFileId,
    } = academicSubjectInput
    const code = normalizeCodeField($code)

    if (!(await this.orgService.validateOrgId(orgId))) {
      this.logger.error(
        `[${this.createAcademicSubject.name}] Invalid orgId ${orgId}`,
      )
      throw new Error('INVALID_ORG_ID')
    }

    if (await this.existsAcademicSubjectByCode(code, orgId)) {
      this.logger.error(
        `[${this.createAcademicSubject.name}] code ${code} is existing in ${orgId}`,
      )
      throw new Error('DUPLICATED_SUBJECT_CODE')
    }

    const academicSubject = await this.academicSubjectModel.create({
      orgId,
      name,
      description,
      createdByAccountId,
      imageFileId,
      code,
      publication: Publication.Draft,
    })
    this.logger.log(
      `[${this.createAcademicSubject.name}] Created academic subject ${academicSubject.id}`,
    )
    this.logger.verbose(academicSubject)

    return academicSubject
  }

  async findAndPaginateAcademicSubjects(
    pageOptions: {
      limit: number
      skip: number
    },
    filter: {
      orgId: string
      searchText?: string
    },
  ): Promise<{
    academicSubjects: DocumentType<AcademicSubject>[]
    count: number
  }> {
    const { limit, skip } = pageOptions
    const { orgId, searchText } = filter

    const academicSubjectModel = this.academicSubjectModel.find({
      orgId,
    })
    if (searchText) {
      const search = removeExtraSpaces(searchText)
      if (search !== undefined && search !== '') {
        academicSubjectModel.find({
          $text: { $search: search },
        })
      }
    }
    academicSubjectModel.sort({ _id: -1 }).skip(skip).limit(limit)
    const academicSubjects = await academicSubjectModel
    const count = await this.academicSubjectModel.countDocuments({ orgId })
    return { academicSubjects, count }
  }

  async findAcademicSubjectById(
    id: string,
  ): Promise<Nullable<DocumentType<AcademicSubject>>> {
    return this.academicSubjectModel.findById(id)
  }

  async updateAcademicSubjectPublication(
    id: string,
    publication: Publication,
  ): Promise<DocumentType<AcademicSubject>> {
    const academicSubject = await this.academicSubjectModel.findById(id)

    if (!academicSubject) {
      throw new Error(`Couldn't find academic subject to update publication`)
    }

    academicSubject.publication = publication

    const updatedAcademicSubject = await academicSubject.save()

    return updatedAcademicSubject
  }

  async updateAcademicSubject(
    query: { id: string; orgId: string },
    update: {
      name?: string
      description?: string
    },
  ): Promise<DocumentType<AcademicSubject>> {
    const academicSubject = await this.academicSubjectModel.findOne({
      _id: query.id,
      orgId: query.orgId,
    })

    if (!academicSubject) {
      throw new Error(`Couldn't find academic subject to update`)
    }

    if (update.name) {
      academicSubject.name = update.name
    }
    if (update.description) {
      academicSubject.description = update.description
    }
    const updatedAcademicSubject = await academicSubject.save()

    return updatedAcademicSubject
  }

  /**
   * START COURSE
   */

  async createCourse(
    creatorId: string,
    orgId: string,
    createCourseInput: CreateCourseInput,
  ): Promise<DocumentType<Course>> {
    const {
      academicSubjectId,
      orgOfficeId,
      name,
      code,
      startDate,
      tuitionFee,
      lecturerIds,
    } = createCourseInput
    if (!(await this.orgService.validateOrgId(orgId))) {
      throw new Error(`Org ID is invalid`)
    }

    // Can create course
    const canCreateCourse = await this.authService.accountHasPermission({
      accountId: creatorId,
      permission: Permission.Academic_CreateCourse,
    })

    if (!canCreateCourse) {
      throw new Error('ACCOUNT_HAS_NOT_PERMISSION')
    }

    // Check the existence of academic subject
    const academicSubjectIsExist =
      (await this.findAcademicSubjectById(
        createCourseInput.academicSubjectId,
      )) !== null

    const orgOfficeIsExist =
      (await this.orgOfficeService.findOrgOfficeById(
        createCourseInput.orgOfficeId,
      )) !== null

    if (!academicSubjectIsExist) {
      throw new Error('ACADEMIC_SUBJECT_NOT_FOUND')
    }

    if (!orgOfficeIsExist) {
      throw new Error('ORG_OFFICE_NOT_FOUND')
    }

    // Must be an array lecturer
    const argsLecturer = createCourseInput.lecturerIds?.map(async (id) => {
      const account = await this.accountService.findOneAccount({
        id,
        orgId,
      })

      if (!account) {
        return Promise.reject(new Error(`ID ${id} is not found`))
      }
      if (!account?.roles.includes('lecturer')) {
        return Promise.reject(
          new Error(`${account?.displayName} isn't a lecturer`),
        )
      }

      return id
    })

    await Promise.all(argsLecturer).catch((err) => {
      throw new Error(err)
    })

    const currentDate = new Date()
    const startDateInput = new Date(startDate)
    if (
      startDateInput.setHours(7, 0, 0, 0) < currentDate.setHours(7, 0, 0, 0)
    ) {
      throw new Error('START_DATE_INVALID')
    }

    const course = this.courseModel.create({
      createdByAccountId: creatorId,
      orgId,
      name,
      code,
      lecturerIds,
      academicSubjectId,
      orgOfficeId,
      startDate: startDateInput,
      tuitionFee,
      publication: Publication.Draft,
    })

    return course
  }

  async updateCourse(
    query: { id: string; orgId: string },
    update: {
      name?: string
      tuitionFee?: number
      startDate?: string
      lecturerIds?: string[]
    },
  ): Promise<DocumentType<Course>> {
    const course = await this.courseModel.findOne({
      _id: query.id,
      orgId: query.orgId,
    })

    if (!course) {
      throw new Error(`Couldn't find course to update`)
    }
    if (update.name) {
      course.name = update.name
    }
    if (update.startDate) {
      const startDateInput = new Date(
        new Date(update.startDate).setHours(7, 0, 0, 0),
      )
      course.startDate = startDateInput
    }
    if (update.tuitionFee) {
      course.tuitionFee = update.tuitionFee
    }
    if (update.lecturerIds) {
      course.lecturerIds = update.lecturerIds
    }

    const updated = await course.save()
    return updated
  }

  async findCourseById(
    id: string,
    orgId: string,
  ): Promise<DocumentType<Course> | null> {
    return this.courseModel.findOne({ _id: id, orgId })
  }

  async findAndPaginateCourses(
    pageOptions: {
      limit: number
      skip: number
    },
    filter: {
      orgId: string
      searchText?: string
      lecturerIds?: string[]
      studentIds?: string[]
    },
  ): Promise<{ courses: DocumentType<Course>[]; count: number }> {
    const { orgId, searchText, lecturerIds, studentIds } = filter
    const { limit, skip } = pageOptions
    const courseModel = this.courseModel.find({
      orgId,
    })
    if (searchText) {
      const search = removeExtraSpaces(searchText)
      if (search !== undefined && search !== '') {
        courseModel.find({
          $text: { $search: search },
        })
      }
    }
    if (lecturerIds) {
      const arrQueryLecturerIds: ANY = []
      lecturerIds.map((lecturerId) => {
        return arrQueryLecturerIds.push({
          lecturerIds: lecturerId,
        })
      })
      courseModel.find({
        $or: arrQueryLecturerIds,
      })
    }
    if (studentIds) {
      const arrQueryStudentIds: ANY = []
      studentIds.map((studentId) => {
        return arrQueryStudentIds.push({
          studentIds: studentId,
        })
      })
      courseModel.find({
        $or: arrQueryStudentIds,
      })
    }
    courseModel.sort({ _id: -1 }).skip(skip).limit(limit)
    const courses = await courseModel
    const count = await this.courseModel.countDocuments({ orgId })
    return { courses, count }
  }

  async addStudentsToCourse(
    query: {
      orgId: string
      courseId: string
    },
    studentIds: string[],
  ): Promise<DocumentType<Course>> {
    const course = await this.courseModel.findOne({
      _id: query.courseId,
      orgId: query.orgId,
    })

    if (!course) {
      throw new Error(`Course isn't found`)
    }

    // Must be an array student
    const argsLecturer = studentIds.map(async (id) => {
      const account = await this.accountService.findOneAccount({
        id,
        orgId: query.orgId,
      })

      if (!account) {
        return Promise.reject(new Error(`ID ${id} is not found`))
      }
      if (!account?.roles.includes('student')) {
        return Promise.reject(
          new Error(`${account?.displayName} isn't a student`),
        )
      }

      // Check studentId is exists
      if (course.studentIds.includes(id)) {
        return Promise.reject(new Error(`${account.displayName} is exists`))
      }
      return id
    })

    await Promise.all(argsLecturer).catch((err) => {
      throw new Error(err)
    })

    studentIds.forEach((id) => {
      course.studentIds.push(id)
    })

    const courseAfter = await course.save()
    return courseAfter
  }

  async addLecturersToCourse(
    query: {
      orgId: string
      courseId: string
    },
    lecturerIds: string[],
  ): Promise<DocumentType<Course>> {
    const course = await this.courseModel.findOne({
      _id: query.courseId,
      orgId: query.orgId,
    })

    if (!course) {
      throw new Error(`Course isn't found`)
    }

    // Must be an array lecturer
    const argsLecturer = lecturerIds.map(async (id) => {
      const account = await this.accountService.findOneAccount({
        id,
        orgId: query.orgId,
      })

      if (!account) {
        return Promise.reject(new Error(`ID ${id} is not found`))
      }
      if (!account?.roles.includes('lecturer')) {
        return Promise.reject(
          new Error(`${account?.displayName} isn't a lecturer`),
        )
      }

      // Check lecturer is exists
      if (course.lecturerIds.includes(id)) {
        return Promise.reject(new Error(`${account.displayName} is exists`))
      }
      return id
    })

    await Promise.all(argsLecturer).catch((err) => {
      throw new Error(err)
    })

    lecturerIds.forEach((id) => {
      course.lecturerIds.push(id)
    })

    const courseAfter = await course.save()
    return courseAfter
  }

  async removeStudentsFromCourse(
    query: {
      id: string
      orgId: string
    },
    studentIds: string[],
  ): Promise<DocumentType<Course> | null> {
    const { id, orgId } = query

    const course = await this.findCourseById(id, orgId)

    if (!course) {
      throw new Error("Couldn't find course to remove students")
    }

    const arrStudent = studentIds.map(async (studentId) => {
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
      if (!course.studentIds.includes(studentId)) {
        return Promise.reject(
          new Error(`${account.displayName} isn't a student of ${course.name}`),
        )
      }

      return id
    })

    await Promise.all(arrStudent).catch((err) => {
      throw new Error(err)
    })
    const { studentIds: listStudentOfCourse } = course
    studentIds.map((studentId) =>
      listStudentOfCourse.splice(listStudentOfCourse.indexOf(studentId), 1),
    )

    course.studentIds = listStudentOfCourse

    const courseUpdated = course.save()

    return courseUpdated
  }

  async removeLecturersFromCourse(
    query: {
      id: string
      orgId: string
    },
    lecturerIds: string[],
  ): Promise<DocumentType<Course>> {
    const { id, orgId } = query
    const course = await this.findCourseById(id, orgId)

    if (!course) {
      throw new Error(`Couldn't find course to remove lecturers`)
    }

    const arrLecturer = lecturerIds.map(async (lecturerId) => {
      const account = await this.accountService.findOneAccount({
        id: lecturerId,
        orgId,
      })

      if (!account) {
        return Promise.reject(new Error(`ID ${lecturerId} is not found`))
      }

      if (!account?.roles.includes('lecturer')) {
        return Promise.reject(
          new Error(`${account?.displayName} isn't a lecturer`),
        )
      }

      if (!course.lecturerIds.includes(lecturerId)) {
        return Promise.reject(
          new Error(
            `${account.displayName} isn't a lecturer of ${course.name}`,
          ),
        )
      }
      return id
    })

    await Promise.all(arrLecturer).catch((err) => {
      throw new Error(err)
    })
    const { lecturerIds: listLecturerOfCourse } = course
    lecturerIds.map((lecturerId) =>
      listLecturerOfCourse.splice(listLecturerOfCourse.indexOf(lecturerId), 1),
    )

    course.lecturerIds = listLecturerOfCourse
    const courseUpdated = course.save()
    return courseUpdated
  }
  /**
   * END COURSE
   */

  /**
   * START LESSON
   */

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

    const course = await this.findCourseById(courseId, orgId)

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
    const { lessonId, orgId, courseId } = query
    const {
      startTime,
      endTime,
      description,
      publicationState,
      absentStudentIds,
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

    if (startTime) {
      lesson.startTime = new Date(startTime)
    }

    if (endTime) {
      lesson.endTime = endTime
    }

    if (absentStudentIds) {
      lesson.absentStudentIds = absentStudentIds
    }

    if (lesson.endTime < lesson.startTime) {
      throw new Error('endTime or startTime invalid')
    }

    const lessons = await lessonModel.find({
      orgId,
      courseId,
    })

    const checkLessonDate = lessons.map((data) => {
      if (data.id !== lesson.id) {
        if (
          (lesson.startTime >= data.startTime &&
            lesson.startTime <= data.endTime) ||
          (lesson.endTime >= data.startTime &&
            lesson.endTime <= data.endTime) ||
          (data.startTime >= lesson.startTime && data.endTime <= lesson.endTime)
        ) {
          return Promise.reject(
            new Error(`THERE_WAS_A_REHEARSAL_CLASS_DURING_THIS_TIME`),
          )
        }
      }

      return lesson
    })

    await Promise.all(checkLessonDate).catch((err) => {
      throw new Error(err)
    })

    if (description) {
      lesson.description = description
    }

    if (publicationState) {
      lesson.publicationState = publicationState
      lesson.updatedByAccountId = updatedByAccountId
    }

    const update = await lesson.save()
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

  /**
   * END LESSON
   */

  /**
   * START STATISTICAL
   */

  async calculateAvgGradeOfClassworkAssignmentInCourse(
    courseId: string,
    orgId: string,
    optionInput: AvgGradeOfClassworkByCourseOptionInput,
  ): Promise<AvgGradeOfClassworkByCourse[]> {
    const { limit } = optionInput

    const { courseModel, classworkAssignmentModel, classworkService } = this

    if (!(await this.orgService.validateOrgId(orgId))) {
      throw new Error(`ORG_ID_INVALID`)
    }

    const course = await courseModel.findOne({
      _id: courseId,
      orgId,
    })

    if (!course) {
      throw new Error(`COURSE_NOT_FOUND`)
    }

    const numberOfStudent = course.studentIds.length

    const classworkAssignments = await classworkAssignmentModel
      .find({
        courseId,
        orgId,
      })
      .sort({ _id: -1 })
      .limit(limit)

    const classworkAssignmentsMap = classworkAssignments.map(
      async (classworkAssignment) => {
        const avgGrade =
          await classworkService.calculateAvgGradeOfClassworkAssignment(
            numberOfStudent,
            classworkAssignment.id,
            orgId,
          )
        const dataObj: AvgGradeOfClassworkByCourse = {
          classworkTitle: classworkAssignment.title,
          avgGrade,
        }
        return dataObj
      },
    )
    const dataList: AvgGradeOfClassworkByCourse[] = await Promise.all(
      classworkAssignmentsMap,
    )
    return dataList
  }

  /**
   * END STATISTICAL
   */
}
