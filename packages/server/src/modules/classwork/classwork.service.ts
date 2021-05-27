import { forwardRef, Inject } from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'

import {
  Service,
  InjectModel,
  Logger,
  Publication,
  removeExtraSpaces,
} from 'core'
import { Course } from 'modules/academic/models/Course'
import { AccountService } from 'modules/account/account.service'
import { AuthService } from 'modules/auth/auth.service'
import { FileStorageService } from 'modules/fileStorage/fileStorage.service'
import { OrgService } from 'modules/org/org.service'
// eslint-disable-next-line import/order
import { ANY, Nullable, PageOptionsInput } from 'types'
import {
  UpdateClassworkMaterialInput,
  CreateClassworkAssignmentInput,
  CreateClassworkMaterialInput,
  AddAttachmentsToClassworkInput,
} from './classwork.type'
import { Classwork, ClassworkType } from './models/Classwork'
import { ClassworkAssignment } from './models/ClassworkAssignment'
import { ClassworkMaterial } from './models/ClassworkMaterial'

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

    @InjectModel(Course)
    private readonly courseModel: ReturnModelType<typeof Course>,

    @Inject(forwardRef(() => FileStorageService))
    private readonly fileStorageService: FileStorageService,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,

    @Inject(forwardRef(() => OrgService))
    private readonly orgService: OrgService,

    @Inject(forwardRef(() => AccountService))
    private readonly accountService: AccountService,
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
    attachmentsInput: AddAttachmentsToClassworkInput,
    uploadedByAccountId: string,
  ): Promise<string[]> {
    const promiseFileUpload = attachmentsInput.attachments
    const listFileId: string[] = []
    if (promiseFileUpload) {
      const arrFileId = promiseFileUpload.map(async (document) => {
        const { createReadStream, filename, encoding } = await document

        // eslint-disable-next-line no-console
        console.log('encoding', encoding)

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

  /**
   * END GENERAL FUNCTION
   */

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

    const { title, description, publicationState, attachments } =
      createClassworkMaterialInput

    if (!(await this.orgService.validateOrgId(orgId)))
      throw new Error('ORG_ID_INVALID')

    if (!(await this.authService.canAccountManageCourse(creatorId, courseId)))
      throw new Error(`ACCOUNT_CAN'T_MANAGE_COURSE`)

    let createInput = {}

    if (publicationState) {
      createInput = {
        description: removeExtraSpaces(description),
        title: removeExtraSpaces(title),
        publicationState,
        createdByAccountId: creatorId,
        orgId,
        courseId,
      }
    } else {
      createInput = {
        description: removeExtraSpaces(description),
        title: removeExtraSpaces(title),
        createdByAccountId: creatorId,
        orgId,
        courseId,
      }
    }
    const classworkMaterial = await this.classworkMaterialModel.create(
      createInput,
    )

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

    const input = { ...updateClassworkMaterialInput }

    if (updateClassworkMaterialInput.title) {
      const title = removeExtraSpaces(updateClassworkMaterialInput.title)
      if (title) {
        input.title = title
      }
    }

    if (updateClassworkMaterialInput.description) {
      input.description = removeExtraSpaces(
        updateClassworkMaterialInput.description,
      )
    }

    const classworkMaterialUpdated =
      await this.classworkMaterialModel.findOneAndUpdate(
        {
          _id: classworkMaterialId,
          orgId,
        },
        input,
        { new: true },
      )

    if (!classworkMaterialUpdated) {
      throw new Error(`CAN'T_TO_UPDATE_CLASSWORKMATERIAL`)
    }

    this.logger.log(
      `[${this.updateClassworkMaterial.name}] Updated classworkMaterial successfully`,
    )

    this.logger.verbose({
      orgId,
      accountId,
      updateClassworkMaterialInput,
    })

    return classworkMaterialUpdated
  }

  async updateClassworkMaterialPublication(
    query: {
      orgId: string
      accountId: string
      classworkMaterialId: string
    },
    publicationState: string,
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

    if (!classworkMaterial) {
      throw new Error(`ClassworkMaterial not found`)
    }

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
    const count = await this.classworkMaterialModel.countDocuments({ orgId })

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
      attachmentsInput,
      uploadedByAccountId,
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
  /**
   * END CLASSWORK MATERIAL
   */

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

    if (!classworkAssignment) {
      throw new Error(`ClassworkAssignment not found.`)
    }

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
    const count = await this.classworkAssignmentsModel.countDocuments({ orgId })

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
    const { title, description, attachments, dueDate, publicationState } =
      classworkAssignmentInput

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
    const dueDateInput = new Date(dueDate)

    if (dueDateInput.setHours(7, 0, 0, 0) < currentDate.setHours(7, 0, 0, 0)) {
      throw new Error(`DUE_DATE_INVALID`)
    }

    const classworkAssignment = this.classworkAssignmentsModel.create({
      createdByAccountId,
      courseId,
      orgId,
      title,
      description,
      attachments,
      publicationState,
      dueDate: dueDateInput,
    })

    return classworkAssignment
  }

  async updateClassworkAssignment(
    query: {
      id: string
      accountId: string
      orgId: string
    },
    update: { title?: string; description?: string; dueDate?: string },
  ): Promise<DocumentType<ClassworkAssignment>> {
    const { id, orgId, accountId } = query

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

    if (update.title) {
      classworkAssignmentUpdate.title = update.title
    }

    if (update.description) {
      classworkAssignmentUpdate.description = update.description
    }

    if (update.dueDate) {
      const currentDate = new Date()
      const dueDateInput = new Date(update.dueDate)
      if (
        dueDateInput.setHours(7, 0, 0, 0) < currentDate.setHours(7, 0, 0, 0)
      ) {
        throw new Error('START_DATE_INVALID')
      }
      classworkAssignmentUpdate.dueDate = dueDateInput
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
    const classworkAssignment = await this.classworkAssignmentsModel.findById(
      query.id,
      query.orgId,
    )

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
      attachmentsInput,
      uploadedByAccountId,
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
  /**
   * END CLASSWORK ASSIGNMENT
   */
}
