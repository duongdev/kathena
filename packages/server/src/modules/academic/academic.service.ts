import { DocumentType, ReturnModelType } from '@typegoose/typegoose'

import { InjectModel, Logger, Publication, Service } from 'core'
import { normalizeCodeField } from 'core/utils/string'
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

  async findAcademicSubjectByCode(
    $code: string,
    orgId?: string,
  ): Promise<DocumentType<AcademicSubject> | null> {
    const code = normalizeCodeField($code)
    const query = orgId ? { code, orgId } : { code }

    return this.academicSubjectModel.findOne(query)
  }

  async existsAcademicSubjectByCode(
    $code: string,
    orgId?: string,
  ): Promise<boolean> {
    const code = normalizeCodeField($code)
    const query = orgId ? { code, orgId } : { code }

    return this.academicSubjectModel.exists(query)
  }

  async createAcademicSubject(academicSubjectInput: {
    orgId: string
    code: string
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
      code: $code,
      name,
      description,
      createdByAccountId,
    } = academicSubjectInput
    const code = normalizeCodeField($code)

    if (!(await this.orgService.validateOrgId(orgId))) {
      this.logger.error(
        `[${this.createAcademicSubject.name}] Invalid orgId ${orgId}`,
      )
      throw new Error('INVALID_ORG_ID')
    }

    if (await this.existsAcademicSubjectByCode(code, orgId)) {
      this.logger.error(
        `[${this.createAcademicSubject.name}] code ${code} is existing in ${orgId}`,
      )
      throw new Error('DUPLICATED_SUBJECT_CODE')
    }

    const academicSubject = await this.academicSubjectModel.create({
      orgId,
      name,
      code,
      description,
      createdByAccountId,
      publication: Publication.Draft,
    })
    this.logger.log(
      `[${this.createAcademicSubject.name}] Created academic subject ${academicSubject.id}`,
    )
    this.logger.verbose(academicSubject)

    return academicSubject
  }
}
