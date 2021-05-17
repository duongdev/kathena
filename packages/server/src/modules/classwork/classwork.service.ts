import { forwardRef, Inject } from '@nestjs/common'
import { ReturnModelType, DocumentType } from '@typegoose/typegoose'

import { Service, InjectModel, Logger, removeExtraSpaces } from 'core'
import { AccountService } from 'modules/account/account.service'
import { AuthService } from 'modules/auth/auth.service'
import { OrgService } from 'modules/org/org.service'

import { UpdateClassworkMaterialInput } from './classwork.type'
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

  // TODO: Delete this line and start the code here

  async updateClassworkMaterial(
    orgId: string,
    accountId: string,
    courseId: string,
    classworkMaterialId: string,
    updateClassworkMaterialInput: UpdateClassworkMaterialInput,
  ): Promise<DocumentType<ClassworkMaterial>> {
    this.logger.log(
      `[${this.updateClassworkMaterial.name}] Creating new classworkMaterial`,
    )

    this.logger.verbose({
      orgId,
      accountId,
      courseId,
      updateClassworkMaterialInput,
    })

    if (!(await this.orgService.validateOrgId(orgId))) {
      throw new Error('ORG_ID_INVALID')
    }

    if (
      !(await this.accountService.findOneAccount({
        id: accountId,
        orgId,
      }))
    ) {
      throw new Error('ACCOUNT_ID_INVALID')
    }

    if (!(await this.authService.canAccountManageCourse(accountId, courseId))) {
      throw new Error(`ACCOUNT_CAN'T_MANAGE_COURSE`)
    }

    const classworkMaterial = await this.classworkMaterialModel.findOne({
      _id: classworkMaterialId,
      orgId,
    })

    if (!classworkMaterial) {
      throw new Error(`CLASSWORKMATERIAL_ID_INVALID`)
    }

    if (updateClassworkMaterialInput.title) {
      const title = removeExtraSpaces(updateClassworkMaterialInput.title)
      if (title) {
        classworkMaterial.title = title
      }
    }

    if (updateClassworkMaterialInput.description) {
      classworkMaterial.description = removeExtraSpaces(
        updateClassworkMaterialInput.description,
      )
    }

    if (updateClassworkMaterialInput.publicationState) {
      classworkMaterial.publicationState =
        updateClassworkMaterialInput.publicationState
    }

    const classworkMaterialUpdated = await classworkMaterial.save()

    this.logger.log(
      `[${this.updateClassworkMaterial.name}] Created classworkMaterial successfully`,
    )

    this.logger.verbose({
      orgId,
      accountId,
      courseId,
      updateClassworkMaterialInput,
    })

    return classworkMaterialUpdated
  }
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
