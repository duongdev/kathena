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
// import { ANY, Nullable } from 'types'

import { PageOptionsInput } from 'types'

import { ClassworkFilterInput } from './classwork.type'
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

  // TODO: Delete this line and start the code here

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

  /**
   * END CLASSWORK ASSIGNMENT
   */
}
