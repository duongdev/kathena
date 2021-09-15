import { forwardRef, Inject } from '@nestjs/common'
import { ReturnModelType, DocumentType } from '@typegoose/typegoose'

import {
  Service,
  InjectModel,
  Logger,
  Publication,
  removeExtraSpaces,
} from 'core'
import { AcademicService } from 'modules/academic/academic.service'
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
import { ANY } from 'types'

import { CreateCourseInput } from './course.type'
import { Course } from './models/Course'

@Service()
export class CourseService {
  private readonly logger = new Logger(CourseService.name)

  constructor(
    @InjectModel(Course)
    private readonly courseModel: ReturnModelType<typeof Course>,

    @InjectModel(ClassworkAssignment)
    private readonly classworkAssignmentModel: ReturnModelType<
      typeof ClassworkAssignment
    >,

    @Inject(forwardRef(() => AcademicService))
    private readonly academicService: AcademicService,

    @Inject(forwardRef(() => OrgService))
    private readonly orgService: OrgService,

    @Inject(forwardRef(() => ClassworkService))
    private readonly classworkService: ClassworkService,

    @Inject(forwardRef(() => OrgOfficeService))
    private readonly orgOfficeService: OrgOfficeService,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,

    @Inject(forwardRef(() => AccountService))
    private readonly accountService: AccountService,
  ) {}

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
      (await this.academicService.findAcademicSubjectById(
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
}