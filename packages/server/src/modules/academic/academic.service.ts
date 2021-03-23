import { DocumentType, ReturnModelType } from '@typegoose/typegoose'

import { InjectModel, Logger, Service } from 'core'
import { OrgService } from 'modules/org/org.service'

import { AcademicSubject } from './models/AcademicSubject'

@Service()
export class AcademicService {
  private readonly logger = new Logger(AcademicService.name)

  constructor(
    private readonly orgService: OrgService,
    @InjectModel(AcademicSubject)
    private readonly academicSubjectModel: ReturnModelType<
      typeof AcademicSubject
    >,
  ) {}

  async createAcademicSubject(academicSubjectInput: {
    orgId: string
    name: string
    description: string
    createdByAccountId: string
  }): Promise<DocumentType<AcademicSubject>> {
    this.logger.log(
      `[${this.createAcademicSubject.name}] Creating academic subject`,
    )
    this.logger.verbose(academicSubjectInput)

    const {
      orgId,
      name,
      description,
      createdByAccountId,
    } = academicSubjectInput

    if (!(await this.orgService.validateOrgId(orgId))) {
      this.logger.error(
        `[${this.createAcademicSubject.name}] Invalid orgId ${orgId}`,
      )
      throw new Error('INVALID_ORG_ID')
    }

    const academicSubject = await this.academicSubjectModel.create({
      orgId,
      name,
      description,
      createdByAccountId,
    })

    this.logger.log(
      `[${this.createAcademicSubject.name}] Created academic subject ${academicSubject.id}`,
    )
    this.logger.verbose(academicSubject)

    return academicSubject
  }
}
