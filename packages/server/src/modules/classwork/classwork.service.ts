import { forwardRef, Inject } from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'

import {
  Service,
  InjectModel,
  Logger,
  Publication,
  removeExtraSpaces,
} from 'core'
import { AuthService } from 'modules/auth/auth.service'
import { OrgService } from 'modules/org/org.service'
// eslint-disable-next-line import/order
import { ANY, Nullable, PageOptionsInput } from 'types'
import {
  CreateClassworkAssignmentInput,
  ClassworkFilterInput,
  CreateClassworkMaterialInput,
} from './classwork.type'
import { ClassworkType, Classwork } from './models/Classwork'
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

  async addAttachmentsToClassworkMaterial(
    orgId: string,
    classworkAssignmentId: string,
    attachments?: string[],
  ): Promise<Nullable<DocumentType<ClassworkMaterial>>> {
    return this.addAttachmentsToClasswork(
      orgId,
      classworkAssignmentId,
      ClassworkType.Material,
      attachments,
    ) as Promise<Nullable<DocumentType<ClassworkMaterial>>>
  }

  async removeAttachmentsFromClassworkMaterial(
    orgId: string,
    classworkAssignmentId: string,
    attachments?: string[],
  ): Promise<Nullable<DocumentType<ClassworkMaterial>>> {
    return this.removeAttachmentsFromClasswork(
      orgId,
      classworkAssignmentId,
      ClassworkType.Material,
      attachments,
    ) as Promise<Nullable<DocumentType<ClassworkMaterial>>>
  }
  // TODO: Delete this line and start the code here

  // TODO: classworkService.findClassworkMaterial

  // TODO: classworkService.updateClassworkMaterial

  // TODO: classworkService.updateClassworkMaterialPublication

  // TODO: classworkService.removeAttachmentsFromClassworkMaterial
  /**
   * END CLASSWORK MATERIAL
   */

  /**
   * START CLASSWORK ASSIGNMENT
   */

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

  async addAttachmentsToClassworkAssignments(
    orgId: string,
    classworkAssignmentId: string,
    attachments?: string[],
  ): Promise<Nullable<DocumentType<ClassworkAssignment>>> {
    return this.addAttachmentsToClasswork(
      orgId,
      classworkAssignmentId,
      ClassworkType.Assignment,
      attachments,
    ) as Promise<Nullable<DocumentType<ClassworkAssignment>>>
  }

  async removeAttachmentsFromClassworkAssignments(
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
