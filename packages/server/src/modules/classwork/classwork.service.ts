/* eslint-disable no-process-env */
import { unlinkSync } from 'fs'

import { forwardRef, Inject } from '@nestjs/common'
import { DocumentType, mongoose, ReturnModelType } from '@typegoose/typegoose'
import { FileUpload } from 'graphql-upload'

import {
  Service,
  InjectModel,
  Logger,
  Publication,
  removeExtraSpaces,
} from 'core'
import { Account } from 'modules/account/models/Account'
import { AuthService } from 'modules/auth/auth.service'
import { CourseService } from 'modules/course/course.service'
import { Course } from 'modules/course/models/Course'
import { FileStorageService } from 'modules/fileStorage/fileStorage.service'
import { File } from 'modules/fileStorage/models/File'
import { MailService } from 'modules/mail/mail.service'
import { OrgService } from 'modules/org/org.service'
import { ANY, Nullable, PageOptionsInput } from 'types'

import { GRADE_MAX, GRADE_MIN } from './classwork.const'
import {
  UpdateClassworkMaterialInput,
  CreateClassworkAssignmentInput,
  CreateClassworkMaterialInput,
  AddAttachmentsToClassworkInput,
  CreateClassworkSubmissionInput,
  SetGradeForClassworkSubmissionInput,
  ClassworkAssignmentByStudentIdInCourseResponse,
  ClassworkAssignmentByStudentIdInCourseInput,
  SubmissionStatusStatistics,
  ClassworkAssignmentByStudentIdInCourseInputStatus,
  ClassworkAssignmentByStudentIdInCourseResponsePayload,
  UpdateClassworkAssignmentInput,
  AddVideoToClassworkInput,
  UpdateClassworkSubmissionInput,
  AddFilesToClassworkSubmissionInput,
} from './classwork.type'
import { Classwork, ClassworkType, Video } from './models/Classwork'
import { ClassworkAssignment } from './models/ClassworkAssignment'
import { ClassworkMaterial } from './models/ClassworkMaterial'
import {
  ClassworkSubmission,
  ClassworkSubmissionStatus,
} from './models/ClassworkSubmission'

@Service()
export class ClassworkService {
  private readonly logger = new Logger(ClassworkService.name)

  constructor(
    @InjectModel(ClassworkAssignment)
    private readonly classworkAssignmentsModel: ReturnModelType<
      typeof ClassworkAssignment
    >,

    @InjectModel(ClassworkMaterial)
    private readonly classworkMaterialModel: ReturnModelType<
      typeof ClassworkMaterial
    >,

    @InjectModel(ClassworkSubmission)
    private readonly classworkSubmissionModel: ReturnModelType<
      typeof ClassworkSubmission
    >,

    @InjectModel(Course)
    private readonly courseModel: ReturnModelType<typeof Course>,

    @InjectModel(Account)
    private readonly accountModel: ReturnModelType<typeof Account>,

    @InjectModel(File)
    private readonly fileModel: ReturnModelType<typeof File>,

    @Inject(forwardRef(() => FileStorageService))
    private readonly fileStorageService: FileStorageService,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,

    @Inject(forwardRef(() => OrgService))
    private readonly orgService: OrgService,

    @Inject(forwardRef(() => MailService))
    private readonly mailService: MailService,

    @Inject(forwardRef(() => CourseService))
    private readonly courseService: CourseService,
  ) {}

  /**
   * START GENERAL FUNCTION
   */

  async addAttachmentsToClasswork(
    orgId: string,
    classworkId: string,
    classworkType: ClassworkType,
    attachments?: string[],
  ): Promise<Nullable<DocumentType<Classwork>>> {
    const { classworkMaterialModel, classworkAssignmentsModel } = this

    let classwork: ANY

    if (classworkType === ClassworkType.Material) {
      classwork = await classworkMaterialModel.findOne({
        _id: classworkId,
        orgId,
      })
    } else if (classworkType === ClassworkType.Assignment) {
      classwork = await classworkAssignmentsModel.findOne({
        _id: classworkId,
        orgId,
      })
    }

    if (classwork && attachments) {
      attachments.forEach((attachment) => {
        classwork.attachments.push(attachment)
      })
    }

    await classwork.save()

    return classwork
  }

  async addSubmissionFiles(
    orgId: string,
    classworkSubmissionId: string,
    submissionFileIds?: string[],
  ): Promise<Nullable<DocumentType<ClassworkSubmission>>> {
    const { classworkSubmissionModel } = this

    const classworkSubmission = await classworkSubmissionModel.findOne({
      _id: classworkSubmissionId,
      orgId,
    })

    if (!classworkSubmission) {
      throw new Error('classworkSubmission not found!')
    }

    const classworkAssignment = await this.findClassworkAssignmentById(
      orgId,
      classworkSubmission.classworkId,
    )

    if (!classworkAssignment) {
      throw new Error(`No assignments for this submission could be found`)
    }

    const currentDate = new Date()
    const dueDateOfClassworkAssignment = classworkAssignment.dueDate

    if (
      dueDateOfClassworkAssignment.setHours(7, 0, 0, 0) <
      currentDate.setHours(7, 0, 0, 0)
    ) {
      throw new Error(`classworkAssignment has expired. Not be edited`)
    }

    if (submissionFileIds) {
      submissionFileIds.forEach((fileIds) => {
        classworkSubmission.submissionFileIds?.push(fileIds)
      })
    }

    await classworkSubmission.save()
    return classworkSubmission
  }

  async removeSubmissionFiles(
    orgId: string,
    classworkSubmissionId: string,
    submissionFileIds?: string[],
  ): Promise<Nullable<DocumentType<ClassworkSubmission>>> {
    const { classworkSubmissionModel } = this

    const classworkSubmission = await classworkSubmissionModel.findOne({
      _id: classworkSubmissionId,
      orgId,
    })

    if (!classworkSubmission) {
      throw new Error('classworkSubmission not found!')
    }

    const classworkAssignment = await this.findClassworkAssignmentById(
      orgId,
      classworkSubmission.classworkId,
    )

    if (!classworkAssignment) {
      throw new Error(`No assignments for this submission could be found`)
    }

    const currentDate = new Date()
    const dueDateOfClassworkAssignment = classworkAssignment.dueDate

    if (
      dueDateOfClassworkAssignment.setHours(7, 0, 0, 0) <
      currentDate.setHours(7, 0, 0, 0)
    ) {
      throw new Error(`classworkAssignment has expired. Not be edited`)
    }

    if (submissionFileIds) {
      const currentSubmissionFiles = classworkSubmission.submissionFileIds

      // eslint-disable-next-line array-callback-return
      submissionFileIds.map(async (fileId) => {
        const index = currentSubmissionFiles?.indexOf(fileId)
        // delete FileId in classworkSubmission
        if (index !== undefined && index >= 0) {
          currentSubmissionFiles?.splice(index, 1)
        }
        // delete file
        const file = await this.fileModel.findById(fileId)
        if (file) {
          unlinkSync(file.storageProviderIdentifier)
        }
        // delete model
        await this.fileModel.deleteOne({ _id: fileId })
      })

      classworkSubmission.submissionFileIds = currentSubmissionFiles
    }

    await classworkSubmission.save()
    return classworkSubmission
  }

  async removeAttachmentsFromClasswork(
    orgId: string,
    classworkId: string,
    classworkType: ClassworkType,
    attachments?: string[],
  ): Promise<Nullable<DocumentType<Classwork>>> {
    const { classworkMaterialModel, classworkAssignmentsModel } = this

    let classwork: ANY

    if (classworkType === ClassworkType.Material) {
      classwork = await classworkMaterialModel.findOne({
        _id: classworkId,
        orgId,
      })
    } else if (classworkType === ClassworkType.Assignment) {
      classwork = await classworkAssignmentsModel.findOne({
        _id: classworkId,
        orgId,
      })
    }

    if (classwork && attachments) {
      const currentAttachments = classwork.attachments

      attachments.map((attachment) =>
        currentAttachments.splice(currentAttachments.indexOf(attachment), 1),
      )

      classwork.attachments = currentAttachments
    }

    await classwork.save()

    return classwork
  }

  async uploadFilesAttachments(
    orgId: string,
    uploadedByAccountId: string,
    attachmentsInput?: Promise<FileUpload>[],
  ): Promise<string[]> {
    const promiseFileUpload = attachmentsInput
    const listFileId: string[] = []
    if (promiseFileUpload) {
      const arrFileId = promiseFileUpload.map(async (document) => {
        const { createReadStream, filename, encoding } = await document

        this.logger.log('encoding', encoding)

        const documentFile = await this.fileStorageService.uploadFromReadStream(
          {
            orgId,
            originalFileName: filename,
            readStream: createReadStream(),
            uploadedByAccountId,
          },
        )

        return documentFile.id
      })

      await Promise.all(arrFileId)
        .then((fileIds) => {
          fileIds.forEach((fileId) => {
            listFileId.push(fileId)
          })
        })
        .catch((err) => {
          throw new Error(err)
        })
    }

    return listFileId
  }

  async uploadThumbnail(
    orgId: string,
    uploadedByAccountId: string,
    thumbnail: Promise<FileUpload>,
  ): Promise<string> {
    const image = await thumbnail

    const { createReadStream, filename, encoding } = image

    this.logger.log('encoding', encoding)

    const imageFile = await this.fileStorageService.uploadFromReadStream({
      orgId,
      originalFileName: filename,
      readStream: createReadStream(),
      uploadedByAccountId,
    })

    return imageFile.id
  }

  async addVideoToClasswork(
    orgId: string,
    classworkId: string,
    classworkType: ClassworkType,
    videoInput: {
      title: string
      thumbnail: string
      iframe: string
    },
  ): Promise<Nullable<DocumentType<Classwork>>> {
    const { classworkMaterialModel, classworkAssignmentsModel } = this

    let classwork: ANY

    if (classworkType === ClassworkType.Material) {
      classwork = await classworkMaterialModel.findOne({
        _id: classworkId,
        orgId,
      })
    } else if (classworkType === ClassworkType.Assignment) {
      classwork = await classworkAssignmentsModel.findOne({
        _id: classworkId,
        orgId,
      })
    }

    if (classwork) {
      classwork.videos.push(videoInput)
    }

    await classwork.save()

    return classwork
  }

  async removeVideoFromClasswork(
    orgId: string,
    classworkId: string,
    classworkType: ClassworkType,
    videoId: string,
  ): Promise<Nullable<DocumentType<Classwork>>> {
    const { classworkMaterialModel, classworkAssignmentsModel } = this

    let classwork: ANY

    if (classworkType === ClassworkType.Material) {
      classwork = await classworkMaterialModel.findOne({
        _id: classworkId,
        orgId,
      })
    } else if (classworkType === ClassworkType.Assignment) {
      classwork = await classworkAssignmentsModel.findOne({
        _id: classworkId,
        orgId,
      })
    }

    if (classwork) {
      const currentVideos = classwork.videos

      const videosFilter = currentVideos.filter((video) => {
        return video.id !== videoId
      })

      classwork.videos = videosFilter
    }

    await classwork.save()

    return classwork
  }

  /**
   * END GENERAL FUNCTION
   */

  //= ==========================================================================

  /**
   * START CLASSWORK MATERIAL
   */
  async createClassworkMaterial(
    creatorId: string,
    orgId: string,
    courseId: string,
    createClassworkMaterialInput: CreateClassworkMaterialInput,
  ): Promise<DocumentType<ClassworkMaterial>> {
    this.logger.log(
      `[${this.createClassworkMaterial.name}] Creating new classworkMaterial`,
    )
    this.logger.verbose({
      creatorId,
      orgId,
      courseId,
      createClassworkMaterialInput,
    })

    const { title, description, publicationState, attachments, videos } =
      createClassworkMaterialInput

    if (!(await this.orgService.validateOrgId(orgId)))
      throw new Error('ORG_ID_INVALID')

    if (!(await this.authService.canAccountManageCourse(creatorId, courseId)))
      throw new Error(`ACCOUNT_CAN'T_MANAGE_COURSE`)

    const listVideos: Video[] = []

    if (videos) {
      const map = videos.map(async (iframeObject) => {
        let imageId = ''
        if (iframeObject.thumbnail) {
          imageId = await this.uploadThumbnail(
            orgId,
            creatorId,
            iframeObject.thumbnail,
          )
        }

        let video: ANY = {
          title: iframeObject.title,
          iframe: iframeObject.iframe,
        }

        if (imageId) {
          video = {
            ...video,
            thumbnail: imageId,
          }
        }

        listVideos.push(video)
      })

      await Promise.all(map)
    }

    const classworkMaterial = await this.classworkMaterialModel.create({
      description: removeExtraSpaces(description),
      title: removeExtraSpaces(title),
      publicationState,
      createdByAccountId: creatorId,
      orgId,
      courseId,
      videos: listVideos,
    })

    let classworkMaterialWithFile: ANY = null

    if (attachments) {
      classworkMaterialWithFile = await this.addAttachmentsToClassworkMaterial(
        orgId,
        classworkMaterial.id,
        {
          attachments,
        },
        creatorId,
      )
      if (!classworkMaterialWithFile) {
        this.classworkMaterialModel.findByIdAndDelete(classworkMaterial.id)
        throw new Error(`CAN'T_UPLOAD_FILE`)
      }
    }

    this.logger.log(
      `[${this.createClassworkMaterial.name}] Created classworkMaterial successfully`,
    )

    this.logger.verbose(classworkMaterial.toObject())

    return classworkMaterialWithFile || classworkMaterial
  }

  async updateClassworkMaterial(
    orgId: string,
    accountId: string,
    classworkMaterialId: string,
    updateClassworkMaterialInput: UpdateClassworkMaterialInput,
  ): Promise<DocumentType<ClassworkMaterial>> {
    this.logger.log(
      `[${this.updateClassworkMaterial.name}] Updating classworkMaterial`,
    )

    this.logger.verbose({
      orgId,
      accountId,
      updateClassworkMaterialInput,
    })

    const { description, title } = updateClassworkMaterialInput

    const classworkMaterial = await this.classworkMaterialModel.findOne({
      _id: classworkMaterialId,
      orgId,
    })

    if (!classworkMaterial) {
      throw new Error(`CLASSWORKMATERIAL_NOT_FOUND`)
    }

    if (
      !(await this.authService.canAccountManageCourse(
        accountId,
        classworkMaterial.courseId,
      ))
    ) {
      throw new Error(`ACCOUNT_CAN'T_MANAGE_COURSE`)
    }

    let updateInput = {}

    this.logger.log('updateInput')
    this.logger.log({ updateInput })

    if (title) {
      updateInput = {
        ...updateInput,
        title: removeExtraSpaces(title),
      }
    }
    if (description) {
      updateInput = {
        ...updateInput,
        description: removeExtraSpaces(description),
      }
    }

    const classworkMaterialUpdated =
      await this.classworkMaterialModel.findOneAndUpdate(
        {
          _id: classworkMaterialId,
          orgId,
        },
        updateInput,
        { new: true },
      )

    if (!classworkMaterialUpdated) {
      throw new Error(`CAN'T_TO_UPDATE_CLASSWORKMATERIAL`)
    }

    this.logger.log(
      `[${this.updateClassworkMaterial.name}] Updated classworkMaterial successfully`,
    )

    this.logger.verbose(classworkMaterialUpdated)

    return classworkMaterialUpdated
  }

  async updateClassworkMaterialPublication(
    query: {
      orgId: string
      accountId: string
      classworkMaterialId: string
    },
    publicationState: Publication,
  ): Promise<DocumentType<ClassworkMaterial>> {
    this.logger.log(
      `[${this.updateClassworkMaterial.name}] Updating classworkMaterialPublication`,
    )

    this.logger.verbose({
      query,
      publicationState,
    })

    const classworkMaterial = await this.classworkMaterialModel.findOne({
      _id: query.classworkMaterialId,
      orgId: query.orgId,
    })

    if (!classworkMaterial) {
      throw new Error(`CLASSWORKMATERIAL_NOT_FOUND`)
    }

    if (
      !(await this.authService.canAccountManageCourse(
        query.accountId,
        classworkMaterial.courseId,
      ))
    ) {
      throw new Error(`ACCOUNT_CAN'T_MANAGE_COURSE`)
    }

    const UpdatedClassworkMaterial =
      await this.classworkMaterialModel.findByIdAndUpdate(
        { _id: classworkMaterial.id, orgId: classworkMaterial.orgId },
        { publicationState },
        { new: true },
      )

    if (!UpdatedClassworkMaterial) {
      throw new Error(`CAN'T_UPDATE_CLASSMATERIAL_PUBLICATION`)
    }

    this.logger.log(
      `[${this.updateClassworkMaterial.name}] Updated classworkMaterialPublication successfully`,
    )

    this.logger.verbose({
      query,
      publicationState,
    })

    return UpdatedClassworkMaterial
  }

  async findClassworkMaterialById(
    orgId: string,
    classworkMaterialId: string,
  ): Promise<Nullable<DocumentType<ClassworkMaterial>>> {
    const classworkMaterial = await this.classworkMaterialModel.findOne({
      orgId,
      _id: classworkMaterialId,
    })

    return classworkMaterial
  }

  async findAndPaginateClassworkMaterials(
    pageOptions: PageOptionsInput,
    filter: {
      orgId: string
      accountId: string
      courseId: string
      searchText?: string
    },
  ): Promise<{
    classworkMaterials: DocumentType<ClassworkMaterial>[]
    count: number
  }> {
    this.logger.log(
      `[${this.findAndPaginateClassworkMaterials.name}] Find and paginate classworkMaterials`,
    )

    this.logger.verbose({
      filter,
    })

    const { limit, skip } = pageOptions
    const { courseModel } = this
    const { orgId, courseId, searchText, accountId } = filter

    const course = await courseModel.findOne({
      _id: courseId,
      orgId,
    })

    if (!course) {
      throw new Error(`COURSE NOT FOUND`)
    }

    let findInput: ANY = null

    if (await this.authService.canAccountManageCourse(accountId, courseId)) {
      findInput = {
        orgId,
        courseId,
      }
    } else if (
      await this.authService.isAccountStudentFormCourse(
        accountId,
        courseId,
        orgId,
      )
    ) {
      findInput = {
        orgId,
        courseId,
        publicationState: Publication.Published,
      }
    } else {
      throw new Error(`ACCOUNT HAVEN'T PERMISSION`)
    }

    const classworkMaterialModels = this.classworkMaterialModel.find(findInput)

    if (searchText) {
      classworkMaterialModels.find({
        $text: {
          $search: searchText,
        },
      })
    }

    classworkMaterialModels.sort({ _id: -1 }).skip(skip).limit(limit)
    const listClassworkMaterials = await classworkMaterialModels
    const count = await this.classworkMaterialModel.count(findInput)

    this.logger.log(
      `[${this.updateClassworkMaterial.name}] Find classworkMaterial successfully`,
    )

    this.logger.verbose({
      filter,
    })

    return { classworkMaterials: listClassworkMaterials, count }
  }

  async addAttachmentsToClassworkMaterial(
    orgId: string,
    classworkMaterialId: string,
    attachmentsInput: AddAttachmentsToClassworkInput,
    uploadedByAccountId: string,
  ): Promise<Nullable<DocumentType<ClassworkMaterial>>> {
    const attachments = await this.uploadFilesAttachments(
      orgId,
      uploadedByAccountId,
      attachmentsInput.attachments,
    )
    return this.addAttachmentsToClasswork(
      orgId,
      classworkMaterialId,
      ClassworkType.Material,
      attachments,
    ) as Promise<Nullable<DocumentType<ClassworkMaterial>>>
  }

  async removeAttachmentsFromClassworkMaterial(
    orgId: string,
    classworkMaterialId: string,
    attachments?: string[],
  ): Promise<Nullable<DocumentType<ClassworkMaterial>>> {
    return this.removeAttachmentsFromClasswork(
      orgId,
      classworkMaterialId,
      ClassworkType.Material,
      attachments,
    ) as Promise<Nullable<DocumentType<ClassworkMaterial>>>
  }

  async cloneClassworkMaterialFromClassworkMaterialId(
    formClassworkMaterialId: string,
    orgId: string,
    toCourseId: string,
    accountId: string,
  ): Promise<Nullable<ClassworkMaterial>> {
    this.logger.log(
      `[${this.cloneClassworkMaterialFromClassworkMaterialId.name}] doing ... `,
    )
    this.logger.verbose(formClassworkMaterialId, orgId, toCourseId, accountId)

    const formClassworkMaterial = await this.findClassworkMaterialById(
      orgId,
      formClassworkMaterialId,
    )

    if (!formClassworkMaterial)
      throw new Error('FORMCLASSWORKMATERIAL_NOT_FOUND')

    const toCourse = await this.courseService.findCourseById(toCourseId, orgId)

    if (!toCourse) throw new Error('TOCOURSE_NOT_FOUND')

    const canAccountManageCourse =
      await this.authService.canAccountManageCourse(accountId, toCourseId)

    if (!canAccountManageCourse) throw new Error(`ACCOUNT_CAN'T_MANAGE_COURSE`)

    const toClassworkMaterial = await this.createClassworkMaterial(
      accountId,
      orgId,
      toCourseId,
      {
        title: formClassworkMaterial.title,
        description: formClassworkMaterial.description,
        publicationState: Publication.Draft,
      },
    )

    const newCloneClassworkMaterial =
      await this.classworkMaterialModel.findByIdAndUpdate(
        toClassworkMaterial.id,
        {
          attachments: formClassworkMaterial.attachments,
          videos: formClassworkMaterial.videos,
        },
        {
          new: true,
        },
      )

    this.logger.log(
      `[${this.cloneClassworkMaterialFromClassworkMaterialId.name}] done ! `,
    )
    this.logger.verbose(newCloneClassworkMaterial)
    return newCloneClassworkMaterial
  }

  async addVideoToClassworkMaterial(
    orgId: string,
    classworkMaterialId: string,
    videoInput: AddVideoToClassworkInput,
    uploadedByAccountId: string,
  ): Promise<Nullable<DocumentType<ClassworkMaterial>>> {
    const { video } = videoInput

    let imageId = ''
    if (video.thumbnail) {
      imageId = await this.uploadThumbnail(
        orgId,
        uploadedByAccountId,
        video.thumbnail,
      )
    }

    let videoObject: ANY = {
      title: video.title,
      iframe: video.iframe,
    }

    if (imageId) {
      videoObject = {
        ...video,
        thumbnail: imageId,
      }
    }
    return this.addVideoToClasswork(
      orgId,
      classworkMaterialId,
      ClassworkType.Material,
      videoObject,
    ) as Promise<Nullable<DocumentType<ClassworkMaterial>>>
  }

  async removeVideoFromClassworkMaterial(
    orgId: string,
    classworkMaterialId: string,
    videoId: string,
  ): Promise<Nullable<DocumentType<ClassworkMaterial>>> {
    return this.removeVideoFromClasswork(
      orgId,
      classworkMaterialId,
      ClassworkType.Material,
      videoId,
    ) as Promise<Nullable<DocumentType<ClassworkMaterial>>>
  }

  async publishAllClassworkMaterialsOfTheCourse(
    courseId: string,
    orgId: string,
    updatedByAccountId: string,
  ): Promise<DocumentType<ClassworkMaterial>[]> {
    const { classworkMaterialModel } = this

    const course = await this.courseService.findCourseById(courseId, orgId)

    if (!course) {
      throw new Error('Khoá học không tồn tại!')
    }

    if (
      !(await this.authService.canAccountManageCourse(
        updatedByAccountId,
        courseId,
      ))
    ) {
      throw new Error(`Tài khoản của bạn không có quyền quản lý khoá hoc này!`)
    }

    const listClassworkMaterials = await classworkMaterialModel.find({
      courseId,
    })

    const listClassworkMaterialsAfterUpdating = listClassworkMaterials.map(
      async (classworkMaterialElement) => {
        const classworkMaterial = classworkMaterialElement
        classworkMaterial.publicationState = Publication.Published
        await classworkMaterial.save()
      },
    )

    await Promise.all(listClassworkMaterialsAfterUpdating).catch((err) => {
      throw new Error(err)
    })

    return listClassworkMaterials
  }
  /**
   * END CLASSWORK MATERIAL
   */

  //= ==========================================================================

  /**
   * START CLASSWORK ASSIGNMENT
   */

  async findClassworkAssignmentById(
    orgId: string,
    classworkAssignmentId: string,
  ): Promise<Nullable<DocumentType<ClassworkAssignment>>> {
    const classworkAssignment = await this.classworkAssignmentsModel.findOne({
      _id: classworkAssignmentId,
      orgId,
    })

    return classworkAssignment
  }

  async findAndPaginateClassworkAssignments(
    pageOptions: PageOptionsInput,
    filter: {
      orgId: string
      accountId: string
      courseId: string
      searchText?: string
    },
  ): Promise<{
    classworkAssignments: DocumentType<ClassworkAssignment>[]
    count: number
  }> {
    this.logger.log(
      `[${this.findAndPaginateClassworkAssignments.name}] Find and paginate classworkAssignments`,
    )

    this.logger.verbose({
      filter,
    })

    const { limit, skip } = pageOptions
    const { courseModel } = this
    const { orgId, courseId, searchText, accountId } = filter

    const course = await courseModel.findOne({
      _id: courseId,
      orgId,
    })

    if (!course) {
      throw new Error(`COURSE NOT FOUND`)
    }

    let findInput: ANY = null

    if (await this.authService.canAccountManageCourse(accountId, courseId)) {
      findInput = {
        orgId,
        courseId,
      }
    } else if (
      await this.authService.isAccountStudentFormCourse(
        accountId,
        courseId,
        orgId,
      )
    ) {
      findInput = {
        orgId,
        courseId,
        publicationState: Publication.Published,
      }
    } else {
      throw new Error(`ACCOUNT HAVEN'T PERMISSION`)
    }

    const classworkAssignmentModel =
      this.classworkAssignmentsModel.find(findInput)

    if (searchText) {
      classworkAssignmentModel.find({
        $text: {
          $search: searchText,
        },
      })
    }

    classworkAssignmentModel.sort({ _id: -1 }).skip(skip).limit(limit)
    const classworkAssignments = await classworkAssignmentModel
    const count = await this.classworkAssignmentsModel.count(findInput)

    this.logger.log(
      `[${this.updateClassworkAssignment.name}] Find classworkAssignment successfully`,
    )

    this.logger.verbose({
      filter,
    })

    return { classworkAssignments, count }
  }

  async createClassworkAssignment(
    createdByAccountId: string,
    courseId: string,
    orgId: string,
    classworkAssignmentInput: CreateClassworkAssignmentInput,
  ): Promise<DocumentType<ClassworkAssignment>> {
    this.logger.log(`[${this.createClassworkAssignment.name}] creating...`)

    this.logger.verbose({
      createdByAccountId,
      courseId,
      orgId,
      classworkAssignmentInput,
    })

    const {
      title,
      description,
      attachments,
      dueDate,
      publicationState,
      videos,
    } = classworkAssignmentInput

    if (!(await this.orgService.validateOrgId(orgId))) {
      throw new Error(`Org ID is invalid`)
    }

    // Can create ClassworkAssignments
    const canCreateClassworkAssignment =
      await this.authService.canAccountManageCourse(
        createdByAccountId,
        courseId,
      )

    if (!canCreateClassworkAssignment) {
      throw new Error(`CAN_NOT_CREATE_CLASSWORK_ASSIGNMENT`)
    }

    const currentDate = new Date()
    let dueDateInput
    if (dueDate) {
      dueDateInput = new Date(dueDate)

      if (
        dueDateInput.setHours(7, 0, 0, 0) < currentDate.setHours(7, 0, 0, 0)
      ) {
        throw new Error(`DUE_DATE_INVALID`)
      }
    }

    const listVideos: Video[] = []

    if (videos) {
      const map = videos.map(async (iframeObject) => {
        let imageId = ''
        if (iframeObject.thumbnail) {
          imageId = await this.uploadThumbnail(
            orgId,
            createdByAccountId,
            iframeObject.thumbnail,
          )
        }

        let video: ANY = {
          title: iframeObject.title,
          iframe: iframeObject.iframe,
        }

        if (imageId) {
          video = {
            ...video,
            thumbnail: imageId,
          }
        }

        listVideos.push(video)
      })

      await Promise.all(map)
    }

    let classworkAssignment = await this.classworkAssignmentsModel.create({
      createdByAccountId,
      courseId,
      orgId,
      title: removeExtraSpaces(title),
      description: removeExtraSpaces(description),
      publicationState,
      dueDate: dueDateInput,
      videos: listVideos,
    })

    if (attachments?.length) {
      classworkAssignment = (await this.addAttachmentsToClassworkAssignment(
        orgId,
        classworkAssignment.id,
        { attachments },
        classworkAssignment.createdByAccountId,
      )) as ANY
    }

    // Send mail
    if (process.env.NODE_ENV !== 'test') {
      const course = await this.courseModel
        .findOne({
          _id: courseId,
          orgId,
        })
        .select({ studentIds: 1, name: 1 })

      if (course) {
        const sendMail = course.studentIds.map(async (id) => {
          const account = await this.accountModel.findById(id)

          if (account) {
            this.mailService.sendNewClassworkAssignmentNotification(
              account,
              course.name,
              classworkAssignment.id,
            )
          }
        })

        Promise.all(sendMail).then(() => {
          this.logger.log('Send mail success!')
        })
      }
    }

    this.logger.log(`[${this.createClassworkAssignment.name}] created !`)

    this.logger.verbose(classworkAssignment)

    return classworkAssignment
  }

  async updateClassworkAssignment(
    query: {
      id: string
      accountId: string
      orgId: string
    },
    update: UpdateClassworkAssignmentInput,
  ): Promise<DocumentType<ClassworkAssignment>> {
    const { id, orgId, accountId } = query
    const { description, dueDate, title } = update

    const classworkAssignmentUpdate =
      await this.classworkAssignmentsModel.findOne({
        _id: id,
        orgId,
      })

    if (!classworkAssignmentUpdate) {
      throw new Error(`Could not find classworkAssignment to update`)
    }

    if (
      !(await this.authService.canAccountManageCourse(
        accountId,
        classworkAssignmentUpdate.courseId,
      ))
    ) {
      throw new Error(`ACCOUNT_CAN'T_MANAGE_COURSE`)
    }

    if (title) {
      classworkAssignmentUpdate.title = title
    }

    if (description) {
      classworkAssignmentUpdate.description = description
    }

    if (dueDate) {
      const currentDate = new Date()
      const dueDateInput = new Date(dueDate)
      if (classworkAssignmentUpdate.dueDate === null) {
        if (
          dueDateInput.setHours(7, 0, 0, 0) < currentDate.setHours(7, 0, 0, 0)
        ) {
          throw new Error('DUE_DATE_INVALID')
        }
        classworkAssignmentUpdate.dueDate = dueDateInput
      } else if (
        classworkAssignmentUpdate.dueDate.setHours(7, 0, 0, 0) !==
        dueDateInput.setHours(7, 0, 0, 0)
      ) {
        if (
          dueDateInput.setHours(7, 0, 0, 0) < currentDate.setHours(7, 0, 0, 0)
        ) {
          throw new Error('DUE_DATE_INVALID')
        }
        classworkAssignmentUpdate.dueDate = dueDateInput
      }
    }

    const updated = await classworkAssignmentUpdate.save()
    return updated
  }

  async updateClassworkAssignmentPublication(
    query: {
      id: string
      accountId: string
      orgId: string
    },
    publicationState: Publication,
  ): Promise<DocumentType<ClassworkAssignment>> {
    const classworkAssignment = await this.classworkAssignmentsModel.findOne({
      _id: query.id,
      orgId: query.orgId,
    })

    if (!classworkAssignment) {
      throw new Error(
        `Couldn't find classworkAssignment to update publicationState`,
      )
    }

    if (
      !(await this.authService.canAccountManageCourse(
        query.accountId,
        classworkAssignment.courseId,
      ))
    ) {
      throw new Error(`ACCOUNT_CAN'T_MANAGE_COURSE`)
    }
    classworkAssignment.publicationState = publicationState

    const updateClassworkAssignmentPublication =
      await classworkAssignment.save()

    return updateClassworkAssignmentPublication
  }

  async addAttachmentsToClassworkAssignment(
    orgId: string,
    classworkAssignmentId: string,
    attachmentsInput: AddAttachmentsToClassworkInput,
    uploadedByAccountId: string,
  ): Promise<Nullable<DocumentType<ClassworkAssignment>>> {
    const attachments = await this.uploadFilesAttachments(
      orgId,
      uploadedByAccountId,
      attachmentsInput.attachments,
    )
    return this.addAttachmentsToClasswork(
      orgId,
      classworkAssignmentId,
      ClassworkType.Assignment,
      attachments,
    ) as Promise<Nullable<DocumentType<ClassworkAssignment>>>
  }

  async removeAttachmentsFromClassworkAssignment(
    orgId: string,
    classworkAssignmentId: string,
    attachments?: string[],
  ): Promise<Nullable<DocumentType<ClassworkAssignment>>> {
    return this.removeAttachmentsFromClasswork(
      orgId,
      classworkAssignmentId,
      ClassworkType.Assignment,
      attachments,
    ) as Promise<Nullable<DocumentType<ClassworkAssignment>>>
  }

  async calculateAvgGradeOfClassworkAssignment(
    numberOfStudent: number,
    classworkAssignmentId: string,
    orgId: string,
  ): Promise<number> {
    const { classworkSubmissionModel } = this

    if (!(await this.orgService.validateOrgId(orgId))) {
      throw new Error(`ORG_ID_INVALID`)
    }

    const classworkAssignment = await this.findClassworkAssignmentById(
      orgId,
      classworkAssignmentId,
    )

    let avgGrade = 0
    if (!classworkAssignment) {
      throw new Error(`NOT_FOUND_CLASSWORK_ASSIGNMENT_IN_COURSE`)
    }

    const classworkSubmissions = await classworkSubmissionModel
      .find({
        classworkId: classworkAssignment.id,
      })
      .select({ grade: 1 })

    let sum = 0

    if (classworkSubmissions.length) {
      const classworkSubmissionsMap = classworkSubmissions.map(
        async (classworkSubmission) => {
          if (classworkSubmission.grade !== null) {
            sum += classworkSubmission.grade
          }
        },
      )

      await Promise.all(classworkSubmissionsMap).then(() => {
        avgGrade = sum / numberOfStudent
      })
    }

    return avgGrade
  }

  async listClassworkAssignmentsByStudentIdInCourse(
    query: ClassworkAssignmentByStudentIdInCourseInput,
    orgId: string,
    accountId: string,
  ): Promise<ClassworkAssignmentByStudentIdInCourseResponsePayload> {
    const { courseId, limit, status } = query
    let { skip } = query
    skip = !skip ? 0 : skip

    this.logger.log(
      `[${this.listClassworkAssignmentsByStudentIdInCourse.name}] List ClassworkSubmissions`,
    )
    this.logger.verbose({
      orgId,
      courseId,
      accountId,
      limit,
      skip,
      status,
    })

    const res: ClassworkAssignmentByStudentIdInCourseResponsePayload =
      new ClassworkAssignmentByStudentIdInCourseResponsePayload()

    const pipeline: ANY = [
      {
        $lookup: {
          from: 'classworksubmissions',
          let: {
            varClassworkAssignmentId: '$_id',
          },
          pipeline: [
            {
              $match: {
                createdByAccountId: mongoose.Types.ObjectId(accountId),
              },
            },
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
            {
              $match: {
                $expr: {
                  $eq: ['$classworkId', '$$varClassworkAssignmentId'],
                },
              },
            },
          ],
          as: 'ClassworkSubmissions',
        },
      },
      { $match: { publicationState: Publication.Published } },
      { $match: { orgId: mongoose.Types.ObjectId(orgId) } },
      { $match: { courseId: mongoose.Types.ObjectId(courseId) } },
      { $sort: { _id: -1 } },
    ]

    let aggregateRes: ANY = []

    aggregateRes = await this.classworkAssignmentsModel.aggregate(pipeline)

    res.list =
      await Promise.all<ClassworkAssignmentByStudentIdInCourseResponse>(
        aggregateRes.map(
          async (
            el,
          ): Promise<ClassworkAssignmentByStudentIdInCourseResponse> => {
            const classworkAssignmentByStudent: ClassworkAssignmentByStudentIdInCourseResponse =
              new ClassworkAssignmentByStudentIdInCourseResponse()

            // eslint-disable-next-line no-underscore-dangle
            classworkAssignmentByStudent.classworkAssignmentId = el._id
            classworkAssignmentByStudent.classworkAssignmentsTitle = el.title
            classworkAssignmentByStudent.dueDate = el.dueDate
            if (el.ClassworkSubmissions.length !== 0) {
              classworkAssignmentByStudent.classworkSubmissionGrade =
                el.ClassworkSubmissions[0].grade
              classworkAssignmentByStudent.classworkSubmissionUpdatedAt =
                el.ClassworkSubmissions[0].updatedAt
              classworkAssignmentByStudent.classworkSubmissionDescription =
                el.ClassworkSubmissions[0].description
            }
            return classworkAssignmentByStudent
          },
        ),
      )

    if (
      status ===
      ClassworkAssignmentByStudentIdInCourseInputStatus.HaveSubmission
    ) {
      res.list = res.list.filter((el): boolean => {
        return !!el.classworkSubmissionUpdatedAt
      })
    } else if (
      status ===
      ClassworkAssignmentByStudentIdInCourseInputStatus.HaveNotSubmission
    ) {
      res.list = res.list.filter((el): boolean => {
        return !el.classworkSubmissionUpdatedAt
      })
    }

    res.count = res.list.length

    res.list = res.list.slice(
      skip,
      skip + limit >= res.count ? res.count : skip + limit,
    )

    this.logger.log(
      `[${this.listClassworkAssignmentsByStudentIdInCourse.name}] listed ClassworkSubmissions`,
    )
    this.logger.verbose({
      orgId,
      courseId,
      accountId,
      limit,
      skip,
      status,
    })

    return res
  }

  async cloneClassworkAssignmentFromClassworkAssignmentId(
    formClassworkAssignmentId: string,
    orgId: string,
    toCourseId: string,
    accountId: string,
  ): Promise<Nullable<ClassworkAssignment>> {
    this.logger.log(
      `[${this.cloneClassworkAssignmentFromClassworkAssignmentId.name}] doing ... `,
    )
    this.logger.verbose(formClassworkAssignmentId, orgId, toCourseId, accountId)

    const formClassworkAssignment = await this.findClassworkAssignmentById(
      orgId,
      formClassworkAssignmentId,
    )

    if (!formClassworkAssignment)
      throw new Error('FORMCLASSWORKASSIGNMENT_NOT_FOUND')

    const toCourse = await this.courseService.findCourseById(toCourseId, orgId)

    if (!toCourse) throw new Error('TOCOURSE_NOT_FOUND')

    const canAccountManageCourse =
      await this.authService.canAccountManageCourse(accountId, toCourseId)

    if (!canAccountManageCourse) throw new Error(`ACCOUNT_CAN'T_MANAGE_COURSE`)

    const toClassworkAssignment = await this.createClassworkAssignment(
      accountId,
      toCourseId,
      orgId,
      {
        title: formClassworkAssignment.title,
        description: formClassworkAssignment.description,
        publicationState: Publication.Draft,
      },
    )

    const newCloneClassworkAssignment =
      await this.classworkAssignmentsModel.findByIdAndUpdate(
        toClassworkAssignment.id,
        {
          attachments: formClassworkAssignment.attachments,
          videos: formClassworkAssignment.videos,
        },
        {
          new: true,
        },
      )

    this.logger.log(
      `[${this.cloneClassworkAssignmentFromClassworkAssignmentId.name}] done ! `,
    )
    this.logger.verbose(newCloneClassworkAssignment)
    return newCloneClassworkAssignment
  }

  async addVideoToClassworkAssignment(
    orgId: string,
    classworkAssignmentId: string,
    videoInput: AddVideoToClassworkInput,
    uploadedByAccountId: string,
  ): Promise<Nullable<DocumentType<ClassworkAssignment>>> {
    const { video } = videoInput

    let imageId = ''
    if (video.thumbnail) {
      imageId = await this.uploadThumbnail(
        orgId,
        uploadedByAccountId,
        video.thumbnail,
      )
    }

    let videoObject: ANY = {
      title: video.title,
      iframe: video.iframe,
    }

    if (imageId) {
      videoObject = {
        ...video,
        thumbnail: imageId,
      }
    }
    return this.addVideoToClasswork(
      orgId,
      classworkAssignmentId,
      ClassworkType.Assignment,
      videoObject,
    ) as Promise<Nullable<DocumentType<ClassworkAssignment>>>
  }

  async removeVideoFromClassworkAssignment(
    orgId: string,
    classworkAssignmentId: string,
    videoId: string,
  ): Promise<Nullable<DocumentType<ClassworkAssignment>>> {
    return this.removeVideoFromClasswork(
      orgId,
      classworkAssignmentId,
      ClassworkType.Assignment,
      videoId,
    ) as Promise<Nullable<DocumentType<ClassworkAssignment>>>
  }
  /**
   * END CLASSWORK ASSIGNMENT
   */

  //= ==========================================================================

  /**
   * START CLASSWORK SUBMISSION
   */

  async createClassworkSubmission(
    orgId: string,
    courseId: string,
    accountId: string,
    createClassworkSubmissionInput: CreateClassworkSubmissionInput,
  ): Promise<DocumentType<ClassworkSubmission>> {
    this.logger.log(
      `[${this.createClassworkSubmission.name}] Creating new createClassworkSubmission`,
    )
    this.logger.verbose({
      orgId,
      courseId,
      createClassworkSubmissionInput,
    })

    const { classworkId, submissionFiles, description } =
      createClassworkSubmissionInput

    if (!(await this.orgService.validateOrgId(orgId)))
      throw new Error('ORG_ID_INVALID')

    if (
      !(await this.authService.isAccountStudentFormCourse(
        accountId,
        courseId,
        orgId,
      ))
    ) {
      throw new Error(`ACCOUNT_ISN'T_A_STUDENT_FORM_COURSE`)
    }

    if (
      await this.classworkSubmissionModel.findOne({
        orgId,
        courseId,
        createdByAccountId: accountId,
        classworkId,
      })
    ) {
      throw new Error(`STUDENT_SUBMITTED_ASSIGNMENTS`)
    }

    const classworkSubmission = await this.classworkSubmissionModel.create({
      createdByAccountId: accountId,
      classworkId,
      courseId,
      description,
      orgId,
    })

    let classworkSubmissionWithFileIds: ANY = null

    if (submissionFiles) {
      const fileIds = await this.uploadFilesAttachments(
        orgId,
        accountId,
        submissionFiles,
      )
      if (!fileIds) {
        this.classworkSubmissionModel.findByIdAndDelete(classworkSubmission)
        throw new Error(`CAN'T_UPLOAD_FILE`)
      }
      classworkSubmissionWithFileIds =
        await this.classworkSubmissionModel.findByIdAndUpdate(
          classworkSubmission.id,
          {
            submissionFileIds: fileIds,
          },
          {
            new: true,
          },
        )
    }

    const res = classworkSubmissionWithFileIds || classworkSubmission

    this.logger.log(
      `[${this.createClassworkSubmission.name}] Created createClassworkSubmission successfully`,
    )

    this.logger.verbose(res.toObject())

    return res
  }

  async updateClassworkSubmission(
    query: {
      classworkSubmissionId: string
      accountId: string
      orgId: string
    },
    update: UpdateClassworkSubmissionInput,
  ): Promise<DocumentType<ClassworkSubmission>> {
    const { classworkSubmissionId, orgId, accountId } = query
    const { description } = update

    const classworkSubmission = await this.classworkSubmissionModel.findOne({
      _id: classworkSubmissionId,
      orgId,
      createdByAccountId: accountId,
    })

    if (!classworkSubmission) {
      throw new Error(`Could not find classworkSubmission to update`)
    }

    const classworkAssignment = await this.findClassworkAssignmentById(
      orgId,
      classworkSubmission.classworkId,
    )

    if (!classworkAssignment) {
      throw new Error(`No assignments for this submission could be found`)
    }

    const currentDate = new Date()
    const dueDateOfClassworkAssignment = classworkAssignment.dueDate

    if (
      dueDateOfClassworkAssignment.setHours(7, 0, 0, 0) <
      currentDate.setHours(7, 0, 0, 0)
    ) {
      throw new Error(`classworkAssignment has expired. Not be edited`)
    }

    if (description) {
      classworkSubmission.description = description
    }

    const updated = await classworkSubmission.save()
    return updated
  }

  async addFilesToClassworkSubmission(
    orgId: string,
    classworkSubmissionId: string,
    submissionFilesInput: AddFilesToClassworkSubmissionInput,
    uploadedByAccountId: string,
  ): Promise<Nullable<DocumentType<ClassworkSubmission>>> {
    const submissionFiles = await this.uploadFilesAttachments(
      orgId,
      uploadedByAccountId,
      submissionFilesInput.submissionFiles,
    )
    return this.addSubmissionFiles(
      orgId,
      classworkSubmissionId,
      submissionFiles,
    )
  }

  async removeFilesFromClassworkSubmission(
    orgId: string,
    classworkSubmissionId: string,
    submissionFiles?: string[],
  ): Promise<Nullable<DocumentType<ClassworkSubmission>>> {
    return this.removeSubmissionFiles(
      orgId,
      classworkSubmissionId,
      submissionFiles,
    )
  }

  async setGradeForClassworkSubmission(
    orgId: string,
    gradeByAccountId: string,
    setGradeForClassworkSubmissionInput: SetGradeForClassworkSubmissionInput,
  ): Promise<DocumentType<ClassworkSubmission>> {
    const { submissionId, grade } = setGradeForClassworkSubmissionInput

    if (!(await this.orgService.validateOrgId(orgId)))
      throw new Error('ORG_ID_INVALID')

    const classworkSubmissionBefore =
      await this.classworkSubmissionModel.findById(submissionId)

    if (!classworkSubmissionBefore) {
      throw new Error(`CLASSWORK_SUBMISSION_NOT_FOUND`)
    }

    const classwork = await this.classworkAssignmentsModel.findById(
      classworkSubmissionBefore.classworkId,
    )

    if (!classwork) {
      throw new Error(`CLASSWORK_NOT_FOUND`)
    }

    if (
      !(await this.authService.canAccountManageCourse(
        gradeByAccountId,
        classwork.courseId,
      ))
    ) {
      throw new Error(`ACCOUNT_ISN'T_A_LECTURER_FORM_COURSE`)
    }

    if (grade < GRADE_MIN || grade > GRADE_MAX) {
      throw new Error(`GRADE_INVALID`)
    }

    classworkSubmissionBefore.grade = grade
    const classworkSubmissionAfter = await classworkSubmissionBefore.save()

    if (process.env.NODE_ENV !== 'test') {
      const classworkSubmission: ClassworkSubmission = classworkSubmissionAfter
      const accountStudent = await this.accountModel.findById(
        classworkSubmission.createdByAccountId,
      )
      const classworkAssignmentDoc =
        await this.classworkAssignmentsModel.findById(
          classworkSubmission.classworkId,
        )

      if (accountStudent && classworkAssignmentDoc) {
        const { courseId } = classworkAssignmentDoc

        const course = await this.courseModel.findById(courseId)

        if (course) {
          const { name } = course
          const send: boolean = await this.mailService.gradedAssignment(
            accountStudent,
            classworkAssignmentDoc,
            name,
          )

          if (send) {
            this.logger.log('Send mail success!')
          }
        }
      }
    }
    return classworkSubmissionAfter
  }

  async listClassworkSubmissionsByClassworkAssignmentId(
    accountId: string,
    orgId: string,
    classworkAssignmentId: string,
  ): Promise<DocumentType<ClassworkSubmission>[]> {
    this.logger.log(
      `[${this.listClassworkSubmissionsByClassworkAssignmentId.name}] List ClassworkSubmissions`,
    )
    this.logger.verbose({
      accountId,
      orgId,
      classworkAssignmentId,
    })

    const classworkAssignment = await this.classworkAssignmentsModel.findOne({
      _id: classworkAssignmentId,
      orgId,
    })

    if (!classworkAssignment) {
      throw new Error('CLASSWORKASSIGNMENT_NOT_FOUND')
    }

    if (
      !(await this.authService.canAccountManageCourse(
        accountId,
        classworkAssignment.courseId,
      ))
    ) {
      throw new Error(`ACCOUNT_CAN'T_MANAGE_COURSE`)
    }

    const list = await this.classworkSubmissionModel.find({
      classworkId: classworkAssignmentId,
      orgId,
    })

    this.logger.log(
      `[${this.listClassworkSubmissionsByClassworkAssignmentId.name}] listed ClassworkSubmissions`,
    )
    this.logger.verbose({
      accountId,
      orgId,
      classworkAssignmentId,
    })

    return list
  }

  async findClassworkSubmissionById(
    orgId: string,
    classworkSubmissionId: string,
  ): Promise<Nullable<DocumentType<ClassworkSubmission>>> {
    const classworkSubmission = await this.classworkSubmissionModel.findOne({
      _id: classworkSubmissionId,
      orgId,
    })

    return classworkSubmission
  }

  async findOneClassworkSubmission(
    orgId: string,
    accountId: string,
    classworkAssignmentId: string,
  ): Promise<Nullable<DocumentType<ClassworkSubmission>>> {
    const classworkSubmission = await this.classworkSubmissionModel.findOne({
      createdByAccountId: accountId,
      classworkId: classworkAssignmentId,
      orgId,
    })

    return classworkSubmission
  }

  async getListOfStudentsSubmitAssignmentsByStatus(
    classworkAssignmentId: string,
    classworkSubmissionStatus: ClassworkSubmissionStatus,
  ): Promise<{
    classworkSubmissions: ClassworkSubmission[]
    count: number
  }> {
    const { classworkSubmissionModel, classworkAssignmentsModel, courseModel } =
      this
    const classworkAssignment = await classworkAssignmentsModel.findById(
      classworkAssignmentId,
    )

    if (!classworkAssignment) {
      throw new Error('CLASSWORK_ASSIGNMENT_NOT_FOUND')
    }

    const course = await courseModel.findById(classworkAssignment.courseId)

    if (!course) {
      throw new Error('COURSE_NOT_FOUND')
    }

    const listClassworkSubmission = await classworkSubmissionModel.find({
      classworkId: classworkAssignmentId,
      courseId: course.id,
    })

    let listFilter: ClassworkSubmission[] = []
    const numberOfStudent: number = course.studentIds.length
    let count = 0

    if (classworkSubmissionStatus === ClassworkSubmissionStatus.Submitted) {
      listFilter = listClassworkSubmission
      count = listFilter.length
    } else if (classworkSubmissionStatus === ClassworkSubmissionStatus.OnTime) {
      listFilter = listClassworkSubmission.filter((classworkSubmission) => {
        const dueDate = new Date(classworkAssignment.dueDate).setHours(
          7,
          0,
          0,
          0,
        )
        const updatedAt = new Date(classworkSubmission.updatedAt).setHours(
          7,
          0,
          0,
          0,
        )
        return updatedAt <= dueDate
      })
      count = listFilter.length
    } else if (classworkSubmissionStatus === ClassworkSubmissionStatus.Late) {
      listFilter = listClassworkSubmission.filter((classworkSubmission) => {
        const dueDate = new Date(classworkAssignment.dueDate).setHours(
          7,
          0,
          0,
          0,
        )
        const updatedAt = new Date(classworkSubmission.updatedAt).setHours(
          7,
          0,
          0,
          0,
        )
        return updatedAt > dueDate
      })
      count = listFilter.length
    } else if (
      classworkSubmissionStatus === ClassworkSubmissionStatus.DoNotSubmit
    ) {
      count = numberOfStudent - listClassworkSubmission.length
      return { classworkSubmissions: listFilter, count }
    }
    return { classworkSubmissions: listFilter, count }
  }

  async submissionStatusStatistics(
    classworkAssignmentId: string,
  ): Promise<SubmissionStatusStatistics[]> {
    const studentDataSubmittedOnTime =
      await this.getListOfStudentsSubmitAssignmentsByStatus(
        classworkAssignmentId,
        ClassworkSubmissionStatus.OnTime,
      )

    const studentDataSubmittedLate =
      await this.getListOfStudentsSubmitAssignmentsByStatus(
        classworkAssignmentId,
        ClassworkSubmissionStatus.Late,
      )

    const studentDataSubmittedDoNotSubmit =
      await this.getListOfStudentsSubmitAssignmentsByStatus(
        classworkAssignmentId,
        ClassworkSubmissionStatus.DoNotSubmit,
      )

    const data: SubmissionStatusStatistics[] = [
      {
        label: 'On Time',
        number: studentDataSubmittedOnTime.count,
      },
      {
        label: 'Late',
        number: studentDataSubmittedLate.count,
      },
      {
        label: 'Do not submit',
        number: studentDataSubmittedDoNotSubmit.count,
      },
    ]

    return data
  }
  /**
   * END CLASSWORK SUBMISSION
   */
}
