import { forwardRef, Inject } from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'

import {
  Service,
  InjectModel,
  Logger,
  Publication,
  removeExtraSpaces,
} from 'core'
import { AccountService } from 'modules/account/account.service'
import { AuthService } from 'modules/auth/auth.service'
import { OrgService } from 'modules/org/org.service'
// eslint-disable-next-line import/order
import { PageOptionsInput, Nullable } from 'types'
import {
  UpdateClassworkMaterialInput,
  CreateClassworkAssignmentInput,
  ClassworkFilterInput,
  CreateClassworkMaterialInput,
} from './classwork.type'
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

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,

    @Inject(forwardRef(() => OrgService))
    private readonly orgService: OrgService,

    @Inject(forwardRef(() => AccountService))
    private readonly accountService: AccountService,
  ) {}

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

    if (!(await this.orgService.validateOrgId(orgId)))
      throw new Error('ORG_ID_INVALID')

    if (!(await this.authService.canAccountManageCourse(creatorId, courseId)))
      throw new Error(`ACCOUNT_CAN'T_MANAGE_COURSE`)

    this.logger.log(createClassworkMaterialInput)

    const classworkMaterial = await this.classworkMaterialModel.create({
      description: removeExtraSpaces(createClassworkMaterialInput.description),
      title: removeExtraSpaces(createClassworkMaterialInput.title),
      publicationState: createClassworkMaterialInput.publicationState,
      createdByAccountId: creatorId,
      orgId,
      courseId,
    })

    this.logger.log(
      `[${this.createClassworkMaterial.name}] Created classworkMaterial successfully`,
    )

    this.logger.verbose(classworkMaterial.toObject())

    return classworkMaterial
  }
  // TODO: Delete this line and start the code here

  // TODO: classworkService.findClassworkMaterial

  // TODO: classworkService.updateClassworkMaterial

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

  // TODO: classworkService.updateClassworkMaterialPublication

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

  // TODO: classworkService.removeAttachmentsFromClassworkMaterial

  async findClassworkMaterialById(
    classworkMaterial: string,
  ): Promise<Nullable<DocumentType<ClassworkMaterial>>> {
    return this.classworkMaterialModel.findById(classworkMaterial)
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
      throw new Error(`This classworkAssignment not found.`)
    }

    return classworkAssignment
  }

  async findAndPaginateClassworkAssignments(
    pageOptions: PageOptionsInput,
    filter: ClassworkFilterInput,
  ): Promise<{
    classworkAssignments: DocumentType<ClassworkAssignment>[]
    count: number
  }> {
    const { limit, skip } = pageOptions
    const { orgId, courseId } = filter

    const classworkAssignmentModel = this.classworkAssignmentsModel.find({
      orgId,
    })

    if (courseId) {
      classworkAssignmentModel.find({
        courseId,
      })
    }

    classworkAssignmentModel.sort({ _id: -1 }).skip(skip).limit(limit)
    const classworkAssignments = await classworkAssignmentModel
    const count = await this.classworkAssignmentsModel.countDocuments({ orgId })
    return { classworkAssignments, count }
  }

  async createClassworkAssignment(
    createdByAccountId: string,
    courseId: string,
    orgId: string,
    classworkAssignmentInput: CreateClassworkAssignmentInput,
  ): Promise<DocumentType<ClassworkAssignment>> {
    const { title, description, attachments, dueDate } =
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
      publicationState: Publication.Draft,
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
  /**
   * END CLASSWORK ASSIGNMENT
   */
}
