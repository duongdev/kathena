import { forwardRef, Inject } from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'
// import * as bcrypt from 'bcrypt'
// import { uniq } from 'lodash'
// import { ForbiddenError } from 'type-graphql'

import { Service, InjectModel, Logger } from 'core'
// import { isObjectId } from 'core/utils/db'
// import {
//   removeExtraSpaces,
//   stringWithoutSpecialCharacters,
// } from 'core/utils/string'
import { AuthService } from 'modules/auth/auth.service'
// import { OrgRoleName, Permission } from 'modules/auth/models'
import { OrgService } from 'modules/org/org.service'
import { ANY, Nullable } from 'types'

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

  /**
   * END CLASSWORK MATERIAL
   */

  /**
   * START CLASSWORK ASSIGNMENT
   */

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
