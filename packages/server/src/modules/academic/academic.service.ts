import { DocumentType, ReturnModelType } from '@typegoose/typegoose'

import { InjectModel, Logger, Publication, Service } from 'core'
import { normalizeCodeField } from 'core/utils/string'
import { OrgService } from 'modules/org/org.service'

import { Nullable } from '../../types'

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
    imageFileId: string
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
      imageFileId,
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
      description,
      createdByAccountId,
      imageFileId,
      code,
      publication: Publication.Draft,
    })
    this.logger.log(
      `[${this.createAcademicSubject.name}] Created academic subject ${academicSubject.id}`,
    )
    this.logger.verbose(academicSubject)

    return academicSubject
  }

  async findAndPaginateAcademicSubjects(
    query: {
      orgId: string
    },
    pageOptions: {
      limit: number
      skip: number
    },
  ): Promise<{
    academicSubjects: DocumentType<AcademicSubject>[]
    count: number
  }> {
    const { orgId } = query
    const { limit, skip } = pageOptions

    const academicSubjects = await this.academicSubjectModel
      .find({ orgId })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)

    const count = await this.academicSubjectModel.countDocuments({ orgId })

    return { academicSubjects, count }
  }

  async findAcademicSubjectById(
    id: string,
  ): Promise<Nullable<DocumentType<AcademicSubject>>> {
    return this.academicSubjectModel.findById(id)
  }

  async toggleAcademicSubjectPublicationById(query: {
    id: string
    orgId: string
  }): Promise<DocumentType<AcademicSubject>> {
    const academicSubject = await this.academicSubjectModel.findOne({
      _id: query.id,
      orgId: query.orgId,
    })

    if (!academicSubject) {
      throw new Error(`Couldn't find academic subject to update publication`)
    }

    if (academicSubject.publication === Publication.Draft) {
      academicSubject.publication = Publication.Published
    } else {
      academicSubject.publication = Publication.Draft
    }
    const updatedAcademicSubject = await academicSubject.save()

    return updatedAcademicSubject
  }

  async updateAcademicSubject(
    query: { id: string; orgId: string },
    update: {
      name?: string
      description?: string
    },
  ): Promise<DocumentType<AcademicSubject>> {
    const academicSubject = await this.academicSubjectModel.findOne({
      _id: query.id,
      orgId: query.orgId,
    })

    if (!academicSubject) {
      throw new Error(`Couldn't find academic subject to update`)
    }

    if (update.name) {
      academicSubject.name = update.name
    }
    if (update.description) {
      academicSubject.description = update.description
    }
    const updatedAcademicSubject = await academicSubject.save()

    return updatedAcademicSubject
  }
}
