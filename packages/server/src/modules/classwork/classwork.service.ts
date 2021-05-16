import { forwardRef, Inject } from '@nestjs/common'
import { ReturnModelType, DocumentType } from '@typegoose/typegoose'

import { Service, InjectModel, Logger } from 'core'
import { AuthService } from 'modules/auth/auth.service'
import { OrgService } from 'modules/org/org.service'

import { CreateClassworkMaterialInput } from './classwork.type'
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
  async createClassworkMaterial(
    creatorId: string,
    orgId: string,
    courseId: string,
    createClassworkMaterialInput: CreateClassworkMaterialInput,
  ): Promise<DocumentType<ClassworkMaterial>> {
    if (!(await this.orgService.existsOrgById(orgId)))
      throw new Error('ORG_ID_NOT_FOUND')

    if (!(await this.authService.canAccountManageCourse(creatorId, courseId)))
      throw new Error(`ACCOUNT_CAN'T_MANAGE_COURSE`)

    const classworkMaterial = await this.classworkMaterialModel.create({
      ...createClassworkMaterialInput,
    })

    if (!classworkMaterial) throw new Error(`CAN'T_CREATE_CLASSWORK`)

    return classworkMaterial
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
