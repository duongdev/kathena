import { forwardRef, Inject } from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'

// import * as bcrypt from 'bcrypt'
// import { uniq } from 'lodash'
// import { ForbiddenError } from 'type-graphql'

import { Service, InjectModel, Logger, Publication } from 'core'
// import { isObjectId } from 'core/utils/db'
// import {
//   removeExtraSpaces,
//   stringWithoutSpecialCharacters,
// } from 'core/utils/string'
import { AuthService } from 'modules/auth/auth.service'
// import { Permission } from 'modules/auth/models'
// import { OrgRoleName, Permission } from 'modules/auth/models'
import { OrgService } from 'modules/org/org.service'
// import { ANY, Nullable } from 'types'

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
   * START CLASSWORK MATERIAL
   */

  async createClassworkAssignments(
    // creatorId: string,
    courseId: string,
    // orgId: string,
    createClassworkAssignmentsInput,
  ): Promise<DocumentType<ClassworkAssignments>> {
    const {
      title,
      type,
      description,
      attachments,
      dueDate,
    } = createClassworkAssignmentsInput

    // Can create ClassworkAssignments
    // const canCreateClassworkAssignments = await this.authService.accountHasPermission(
    //   {
    //     accountId: creatorId,
    //     permission: Permission.Classwork_CreateClassworkAssignments,
    //   },
    // )

    const classworkAssignments = this.classworkAssignmentsModel.create({
      courseId,
      title,
      type,
      description,
      attachments,
      publicationState: Publication.Draft,
      dueDate,
    })

    return classworkAssignments
  }
  // TODO: Delete this line and start the code here

  /**
   * END CLASSWORK MATERIAL
   */

  /**
   * START CLASSWORK ASSIGNMENT
   */

  // TODO: Delete this line and start the code here

  /**
   * END CLASSWORK ASSIGNMENT
   */
}
