import { Logger } from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'
import { isValidObjectId, Types } from 'mongoose'

import { InjectModel, Service } from 'core'
import { Nullable } from 'types'

import { Org } from './models/Org'

@Service()
export class OrgService {
  private readonly logger = new Logger(OrgService.name)

  constructor(
    @InjectModel(Org) private readonly orgModel: ReturnModelType<typeof Org>,
  ) {}

  async createOrg(args: {
    namespace: string
    name: string
  }): Promise<DocumentType<Org>> {
    this.logger.log(`[${this.createOrg.name}] Creating new org`)
    this.logger.log(args)

    const { name, namespace } = args

    if (await this.orgModel.exists({ namespace })) {
      this.logger.log(
        `[${this.createOrg.name}] Org with namespace ${namespace} existed`,
      )
      throw new Error(`Org namespace existed`)
    }

    const orgId = Types.ObjectId()

    const org = await this.orgModel.create({
      _id: orgId,
      name,
      namespace,
      orgId,
    })

    return org
  }

  async findOrgById(id: string): Promise<Nullable<DocumentType<Org>>> {
    try {
      return await this.orgModel.findById(id)
    } catch (err) {
      return null
    }
  }

  async findOrgByNamespace(
    namespace: string,
  ): Promise<Nullable<DocumentType<Org>>> {
    const a = await this.orgModel.findOne({ namespace })
    return a
  }

  async existsOrgByNamespace(namespace: string): Promise<boolean> {
    return this.orgModel.exists({ namespace })
  }

  async existsOrgById(id: string): Promise<boolean> {
    return this.orgModel.exists({ _id: id })
  }

  async validateOrgId(id?: string | null): Promise<boolean> {
    if (!(id && isValidObjectId(id))) return false

    const exists = await this.existsOrgById(id)

    return exists
  }
}
