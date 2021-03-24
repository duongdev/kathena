import { Logger } from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'
import { Types } from 'mongoose'

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
    return this.orgModel.findById(id)
  }

  async findOrgByNamespace(
    namespace: string,
  ): Promise<Nullable<DocumentType<Org>>> {
    if (!namespace) {
      throw new Error(`NAMESPACE_IS_NOT_FOUND`)
    }
    return this.orgModel.findOne({ namespace })
  }

  async existsOrgByNamespace(namespace: string): Promise<boolean> {
    return this.orgModel.exists({ namespace })
  }

  async existsOrgById(id: string): Promise<boolean> {
    return this.orgModel.exists({ _id: id })
  }
}
