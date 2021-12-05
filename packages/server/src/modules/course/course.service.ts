/* eslint-disable array-callback-return */
import { forwardRef, Inject } from '@nestjs/common'
import { ReturnModelType, DocumentType } from '@typegoose/typegoose'

import {
  Service,
  InjectModel,
  Logger,
  Publication,
  removeExtraSpaces,
} from 'core'
import { MAX_TOTAL_NUMBER_OF_LESSONS_WHEN_CREATE_COURSE } from 'core/constants'
import { AcademicService } from 'modules/academic/academic.service'
import { AccountService } from 'modules/account/account.service'
import { Account } from 'modules/account/models/Account'
import { AuthService } from 'modules/auth/auth.service'
import { Permission, Role } from 'modules/auth/models'
import { ClassworkService } from 'modules/classwork/classwork.service'
import {
  AvgGradeOfClassworkByCourse,
  AvgGradeOfClassworkByCourseOptionInput,
} from 'modules/classwork/classwork.type'
import { ClassworkAssignment } from 'modules/classwork/models/ClassworkAssignment'
import { ClassworkMaterial } from 'modules/classwork/models/ClassworkMaterial'
import { LessonService } from 'modules/lesson/lesson.service'
import { GenerateLessonsInput } from 'modules/lesson/lesson.type'
import { Lesson } from 'modules/lesson/models/Lesson'
import { OrgService } from 'modules/org/org.service'
import { OrgOfficeService } from 'modules/orgOffice/orgOffice.service'
import { QuizService } from 'modules/quiz/quiz.service'
import { ANY, Nullable } from 'types'

import {
  CloneCourseInput,
  CreateCourseInput,
  UpdateCourseInput,
} from './course.type'
import { Course } from './models/Course'

@Service()
export class CourseService {
  private readonly logger = new Logger(CourseService.name)

  constructor(
    @InjectModel(ClassworkAssignment)
    private readonly classworkAssignmentModel: ReturnModelType<
      typeof ClassworkAssignment
    >,

    @InjectModel(ClassworkMaterial)
    private readonly classworkMaterialModel: ReturnModelType<
      typeof ClassworkMaterial
    >,

    @InjectModel(Course)
    private readonly courseModel: ReturnModelType<typeof Course>,

    @InjectModel(Lesson)
    private readonly lessonModel: ReturnModelType<typeof Lesson>,

    @Inject(forwardRef(() => ClassworkService))
    private readonly classworkService: ClassworkService,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,

    @Inject(forwardRef(() => AccountService))
    private readonly accountService: AccountService,

    @Inject(forwardRef(() => OrgOfficeService))
    private readonly orgOfficeService: OrgOfficeService,

    @Inject(forwardRef(() => AcademicService))
    private readonly academicService: AcademicService,

    @Inject(forwardRef(() => LessonService))
    private readonly lessonService: LessonService,

    @Inject(forwardRef(() => OrgService))
    private readonly orgService: OrgService,

    @Inject(forwardRef(() => QuizService))
    private readonly quizService: QuizService,
  ) {}

  async createCourse(
    creatorId: string,
    orgId: string,
    createCourseInput: CreateCourseInput,
  ): Promise<DocumentType<Course>> {
    this.logger.log(`[${this.createCourse.name}] creating ...`)
    this.logger.verbose(createCourseInput)

    const {
      academicSubjectId,
      orgOfficeId,
      name,
      code,
      startDate,
      tuitionFee,
      lecturerIds,
      daysOfTheWeek,
      totalNumberOfLessons,
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
    const academicSubject = await this.academicService.findAcademicSubjectById(
      createCourseInput.academicSubjectId,
    )

    const orgOfficeIsExist =
      (await this.orgOfficeService.findOrgOfficeById(
        createCourseInput.orgOfficeId,
      )) !== null

    if (!academicSubject) {
      throw new Error('ACADEMIC_SUBJECT_NOT_FOUND')
    }

    if (!orgOfficeIsExist) {
      throw new Error('ORG_OFFICE_NOT_FOUND')
    }

    if (createCourseInput.lecturerIds != null) {
      // Must be an array lecturer
      const argsLecturer = createCourseInput.lecturerIds.map(async (id) => {
        const account = await this.accountService.findOneAccount({
          id,
          orgId,
        })

        if (!account) {
          return Promise.reject(new Error(`ID ${id} is not found`))
        }
        if (!account.roles.includes('lecturer')) {
          return Promise.reject(
            new Error(`${account?.displayName} isn't a lecturer`),
          )
        }

        return id
      })

      await Promise.all(argsLecturer).catch((err) => {
        throw new Error(err)
      })
    }

    const currentDate = new Date()
    const startDateInput = new Date(startDate)

    if (startDateInput < currentDate) {
      throw new Error('START_DATE_INVALID')
    }

    if (totalNumberOfLessons > MAX_TOTAL_NUMBER_OF_LESSONS_WHEN_CREATE_COURSE) {
      throw new Error(
        `Tổng số buổi học tạo tự động không được lớn hơn ${MAX_TOTAL_NUMBER_OF_LESSONS_WHEN_CREATE_COURSE} buổi!`,
      )
    }

    if (academicSubject.publication === Publication.Draft) {
      throw new Error(`CAN_NOT_CREATE_COURSE_WHEN_ACADEMIC_SUBJECT_IS_A_DRAFT`)
    }

    const course = await this.courseModel.create({
      createdByAccountId: creatorId,
      orgId,
      name,
      code,
      lecturerIds,
      academicSubjectId,
      orgOfficeId,
      startDate: startDateInput,
      listOfLessonsForAWeek: daysOfTheWeek,
      tuitionFee,
      publication: Publication.Draft,
      totalNumberOfLessons,
    })

    if (daysOfTheWeek.length !== 0 && totalNumberOfLessons !== 0) {
      const generateLessonsInput: GenerateLessonsInput = {
        courseStartDate: course.startDate,
        daysOfTheWeek,
        totalNumberOfLessons,
      }
      await Promise.all([
        this.lessonService.generateLessons(
          orgId,
          course.id,
          creatorId,
          generateLessonsInput,
        ),
      ])
    }

    this.logger.log(`[${this.createCourse.name}] created ...`)
    this.logger.verbose(course)
    return course
  }

  async updateCourse(
    query: { id: string; orgId: string },
    update: UpdateCourseInput,
  ): Promise<Nullable<DocumentType<Course>>> {
    this.logger.log(`[${this.updateCourse.name}] updating ...`)
    this.logger.verbose({ query, update })

    const { id, orgId } = query
    const { daysOfTheWeek, lecturerIds, name, startDate, tuitionFee } = update

    const course = await this.courseModel.findOne({
      _id: id,
      orgId,
    })

    if (!course) {
      throw new Error(`COURSE_NOT_FOUND`)
    }

    if (
      course.startDate < new Date() &&
      course.publicationState === Publication.Published
    ) {
      throw new Error('Khóa học đang được dạy và học không thể chỉnh sửa !')
    }

    let updateInput = {}

    if (name) {
      updateInput = {
        name,
      }
    }

    if (tuitionFee) {
      if (tuitionFee < 0) {
        throw new Error('TUITION_FEE_MUST_BE_POSITIVE')
      }
      updateInput = {
        ...updateInput,
        tuitionFee,
      }
    }

    if (lecturerIds) {
      await Promise.all(
        lecturerIds.map(async (lecturerId: string): Promise<void> => {
          const roles = await this.authService.getAccountRoles(lecturerId)
          const accountHaveNotLecturerRole = roles.every(
            (role: Role): boolean => {
              if (role.name !== 'lecturer') return true
              return false
            },
          )

          if (accountHaveNotLecturerRole) {
            throw new Error('ACCOUNT_IS_NOT_LECTURER')
          }
        }),
      )

      updateInput = {
        ...updateInput,
        lecturerIds,
      }
    }

    let changeTime = false

    if (startDate || daysOfTheWeek) {
      if (startDate) {
        const currentDate = new Date()

        if (startDate < currentDate) {
          throw new Error('START_DATE_INVALID')
        }

        updateInput = {
          ...updateInput,
          startDate,
        }
      }

      if (daysOfTheWeek) {
        updateInput = {
          ...updateInput,
          listOfLessonsForAWeek: daysOfTheWeek,
        }
      }

      changeTime = true
    }

    const updated = await this.courseModel.findByIdAndUpdate(
      course.id,
      updateInput,
      { new: true },
    )

    if (updated && changeTime) {
      const schedule =
        await this.lessonService.generateArrayDateTimeOfTheLessons({
          courseStartDate: updated.startDate,
          daysOfTheWeek: updated.listOfLessonsForAWeek,
          totalNumberOfLessons: updated.totalNumberOfLessons,
        })

      const ascending = 1
      const listLesson = await this.lessonModel.find(
        {
          orgId,
          courseId: id,
        },
        null,
        { sort: { startTime: ascending } },
      )

      Promise.all(
        listLesson.map(async (lesson, index): Promise<void> => {
          await this.lessonModel.findByIdAndUpdate(lesson.id, {
            startTime: schedule[index].startTime,
            endTime: schedule[index].endTime,
          })
        }),
      )
    }

    this.logger.log(`[${this.updateCourse.name}] updated ...`)
    this.logger.verbose(updated)
    return updated
  }

  async updateCoursePublicationById(
    query: {
      courseId: string
      orgId: string
    },
    updateInput: {
      publication: Publication
    },
  ): Promise<DocumentType<Course>> {
    const { courseId, orgId } = query
    const { publication } = updateInput

    const course = await this.courseModel.findOne({
      _id: courseId,
      orgId,
    })

    if (!course) {
      throw new Error('Course is not found')
    }

    course.publicationState = publication
    const update = await course.save()

    return update
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
    this.logger.log(`[${this.addStudentsToCourse.name}] doing ...`)
    this.logger.verbose({ query, studentIds })
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

    course.studentIds = course.studentIds.concat(studentIds)

    const listStudent: Account[] = await Promise.all(
      course.studentIds.map(async (studentId: string): Promise<Account> => {
        const student = await this.accountService.findAccountById(studentId)
        if (!student) throw new Error('học viên không tồn tại')
        return student
      }),
    )

    // eslint-disable-next-line consistent-return
    listStudent.sort((a: Account, b: Account): ANY => {
      const arrayNameStudentA = a.displayName.split(' ')
      const nameStudentA = `${
        arrayNameStudentA[arrayNameStudentA.length - 1]
      } ${arrayNameStudentA.join(' ')}`

      const arrayNameStudentB = b.displayName.split(' ')
      const nameStudentB = `${
        arrayNameStudentB[arrayNameStudentB.length - 1]
      } ${arrayNameStudentB.join(' ')}`

      return nameStudentA.localeCompare(nameStudentB)
    })

    const listStudentIdSorted = await Promise.all(
      listStudent.map((student: Account): string => {
        return student.id
      }),
    )
    course.studentIds = listStudentIdSorted

    const courseAfter = await course.save()

    this.logger.log(`[${this.addStudentsToCourse.name}] done !`)
    this.logger.verbose(courseAfter)
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

  async cloneTheCourse(
    creatorId: string,
    orgId: string,
    cloneCourseInput: CloneCourseInput,
  ): Promise<DocumentType<Course>> {
    this.logger.log(`[${this.cloneTheCourse.name}] cloning ...`)
    this.logger.verbose(creatorId, orgId, cloneCourseInput)

    const {
      courseIdMustCopy,
      code,
      orgOfficeId,
      tuitionFee,
      startDate,
      name,
      lecturerIds,
      daysOfTheWeek,
    } = cloneCourseInput

    const courseMustClone = await this.findCourseById(courseIdMustCopy, orgId)

    if (!courseMustClone) {
      throw new Error('COURSE_MUST_COPY_NOT_FOUND')
    }

    const academicSubjectIsExist =
      await this.academicService.findAcademicSubjectById(
        courseMustClone.academicSubjectId,
      )

    if (!academicSubjectIsExist) {
      throw new Error('ACADEMIC_SUBJECT_NOT_FOUND')
    }

    const orgOfficeIsExist = await this.orgOfficeService.findOrgOfficeById(
      orgOfficeId,
    )

    if (!orgOfficeIsExist) {
      throw new Error('ORG_OFFICE_NOT_FOUND')
    }

    if (lecturerIds) {
      // Must be an array lecturer
      const argsLecturer = lecturerIds.map(async (id) => {
        const account = await this.accountService.findOneAccount({
          id,
          orgId,
        })

        if (!account) {
          return Promise.reject(new Error(`ID ${id} is not found`))
        }
        if (!account.roles.includes('lecturer')) {
          return Promise.reject(
            new Error(`${account?.displayName} isn't a lecturer`),
          )
        }

        return id
      })

      await Promise.all(argsLecturer).catch((err) => {
        throw new Error(err)
      })
    }

    const currentDate = new Date()
    const startDateInput = new Date(startDate)

    if (startDateInput < currentDate) {
      throw new Error('START_DATE_INVALID')
    }

    const createCloneCourseInput: CreateCourseInput = {
      name,
      code,
      lecturerIds: !lecturerIds ? courseMustClone.lecturerIds : lecturerIds,
      academicSubjectId: courseMustClone.academicSubjectId,
      orgOfficeId,
      startDate: startDateInput,
      tuitionFee: !tuitionFee ? courseMustClone.tuitionFee : tuitionFee,
      daysOfTheWeek: !daysOfTheWeek
        ? courseMustClone.listOfLessonsForAWeek
        : daysOfTheWeek,
      totalNumberOfLessons: courseMustClone.totalNumberOfLessons,
    }

    const cloneCourse = await this.createCourse(
      creatorId,
      orgId,
      createCloneCourseInput,
    )

    const ascending = 1
    const listLessonInCloneCourse = await this.lessonModel.find(
      {
        orgId,
        courseId: cloneCourse.id,
      },
      null,
      { sort: { startTime: ascending } },
    )

    const listLessonInCourseMustClone = await this.lessonModel.find(
      {
        orgId,
        courseId: courseMustClone.id,
      },
      null,
      { sort: { startTime: ascending } },
    )

    const listClassworkMaterialInCourseMustClone =
      await this.classworkMaterialModel.find({
        courseId: courseIdMustCopy,
      })

    const listClassworkAssignmentInCourseMustClone =
      await this.classworkAssignmentModel.find({
        courseId: courseIdMustCopy,
      })

    const mapLessonId: Map<string, string> = new Map()
    const mapClassworkMaterial: Map<string, string> = new Map()
    const mapClassworkAssignment: Map<string, string> = new Map()

    // Mapping lessonId form course must clone and lessonId form clone course
    listLessonInCourseMustClone.forEach((lesson, index): void => {
      mapLessonId.set(lesson.id, listLessonInCloneCourse[index].id)
    })

    const eachClassworkMaterial = async (
      classworkMaterialId: string,
    ): Promise<void> => {
      if (!mapClassworkMaterial.get(classworkMaterialId)) {
        const newClasswork =
          await this.classworkService.cloneClassworkMaterialFromClassworkMaterialId(
            classworkMaterialId,
            orgId,
            cloneCourse.id,
            creatorId,
          )
        if (newClasswork)
          mapClassworkMaterial.set(classworkMaterialId, newClasswork.id)
      }
    }

    const eachClassworkAssignment = async (
      classworkAssignmentId: string,
    ): Promise<void> => {
      if (!mapClassworkAssignment.get(classworkAssignmentId)) {
        const newClasswork =
          await this.classworkService.cloneClassworkAssignmentFromClassworkAssignmentId(
            classworkAssignmentId,
            orgId,
            cloneCourse.id,
            creatorId,
          )
        if (newClasswork)
          mapClassworkMaterial.set(classworkAssignmentId, newClasswork.id)
      }
    }

    const mappingClassworkMaterialId =
      listClassworkMaterialInCourseMustClone.map(
        async (classworkMaterial): Promise<void> => {
          await eachClassworkMaterial(classworkMaterial.id)
        },
      )

    const mappingClassworkAssignmentId =
      listClassworkAssignmentInCourseMustClone.map(
        async (classworkAssignment): Promise<void> => {
          await eachClassworkAssignment(classworkAssignment.id)
        },
      )

    const getListClassworkMaterialIdAfterClone = (
      listClassworkMaterialIdIdInLesson: string[],
    ): string[] => {
      const newList: string[] = []
      listClassworkMaterialIdIdInLesson.forEach(
        (classworkMaterialIdId): ANY => {
          const newClassworkMaterialIdId = mapClassworkMaterial.get(
            classworkMaterialIdId,
          )
          if (newClassworkMaterialIdId) newList.push(newClassworkMaterialIdId)
        },
      )
      return newList
    }

    const getListClassworkAssignmentAfterClone = (
      listClassworkAssignmentIdInLesson: string[],
    ): string[] => {
      const newList: string[] = []
      listClassworkAssignmentIdInLesson.forEach(
        (classworkAssignmentId): ANY => {
          const newClassworkAssignmentId = mapClassworkAssignment.get(
            classworkAssignmentId,
          )
          if (newClassworkAssignmentId) newList.push(newClassworkAssignmentId)
        },
      )
      return newList
    }

    await Promise.all([
      mappingClassworkMaterialId,
      mappingClassworkAssignmentId,
    ])

    await Promise.all(
      listLessonInCourseMustClone.map(async (lesson): Promise<void> => {
        const lessonIdToUpdate = mapLessonId.get(lesson.id)
        if (!lessonIdToUpdate) return

        const classworkMaterialListBeforeClass =
          getListClassworkMaterialIdAfterClone(
            lesson.classworkMaterialListBeforeClass,
          )
        const classworkMaterialListInClass =
          getListClassworkMaterialIdAfterClone(
            lesson.classworkMaterialListInClass,
          )
        const classworkMaterialListAfterClass =
          getListClassworkMaterialIdAfterClone(
            lesson.classworkMaterialListAfterClass,
          )

        const classworkAssignmentListBeforeClass =
          getListClassworkAssignmentAfterClone(
            lesson.classworkAssignmentListBeforeClass,
          )
        const classworkAssignmentListInClass =
          getListClassworkAssignmentAfterClone(
            lesson.classworkAssignmentListInClass,
          )
        const classworkAssignmentListAfterClass =
          getListClassworkAssignmentAfterClone(
            lesson.classworkAssignmentListAfterClass,
          )

        await this.lessonService.updateLessonById(
          {
            lessonId: lessonIdToUpdate,
            orgId,
            courseId: cloneCourse.id,
          },
          {
            classworkAssignmentListAfterClass,
            classworkAssignmentListBeforeClass,
            classworkAssignmentListInClass,
            classworkMaterialListAfterClass,
            classworkMaterialListBeforeClass,
            classworkMaterialListInClass,
            description: lesson.description,
          },
          creatorId,
        )
      }),
    )

    await this.quizService.cloneQuizzes({
      creatorId,
      newCourseId: cloneCourse.id,
      oldCourseId: courseMustClone.id,
      orgId,
    })

    this.logger.log(`[${this.cloneTheCourse.name}] cloned ...`)
    this.logger.verbose(cloneCourse)
    return cloneCourse
  }
}
