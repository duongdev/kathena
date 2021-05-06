import { forwardRef, Inject } from '@nestjs/common'
import { /** DocumentType */ ReturnModelType } from '@typegoose/typegoose'
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

import { ClassworkAssignments } from './models/ClassworkAssignments'
import { ClassworkMaterial } from './models/ClassworkMaterial'

@Service()
export class ClassworkService {
  private readonly logger = new Logger(ClassworkService.name)

  constructor(
    @InjectModel(ClassworkAssignments)
    private readonly classworkAssignmentsModel: ReturnModelType<
      typeof ClassworkAssignments
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
   * END CLASSWORK
   */

  /**
   * START CLASSWORK ASSIGNMENT
   */

  // TODO: Delete this line and start the code here

  /**
   * END CLASSWORK
   */
}
