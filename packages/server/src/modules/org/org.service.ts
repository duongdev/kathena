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

  async validatorInputNamespace(namespace: string): Promise<boolean> {
    // this namespace is '' or '    ' return false
    if (!namespace.trim()) return false

    // this namespace is 'Dang Hieu Liem' return false
    if (namespace.trim().indexOf(' ') === -1) return false

    return true
  }

  async validatorInputName(name: string): Promise<boolean> {
    // this name is '' or '    ' return false
    if (!name.trim()) return false

    return true
  }

  async createOrg(args: {
    namespace: string
    name: string
  }): Promise<DocumentType<Org>> {
    this.logger.log(`[${this.createOrg.name}] Creating new org`)
    this.logger.log(args)

    args.name.replace(/\s+/g, ' ').trim()
    const { name, namespace } = args

    if (!(await this.orgModel.exists({ namespace }))) {
      this.logger.log(
        `[${this.createOrg.name}] Org with namespace ${namespace} existed`,
      )
      throw new Error(`Org namespace existed`)
    }

    if (!(await this.validatorInputNamespace(namespace))) {
      let er = 'Org namespace invalid'

      this.logger.log(
        `[${this.createOrg.name}] Org with namespace '${namespace}' invalid`,
      )

      if (!(await this.validatorInputName(name))) {
        this.logger.log(
          `[${this.createOrg.name}] Org with name '${name}' invalid`,
        )
        er += ` and name invalid`
      }

      throw new Error(`er`)
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
    return this.orgModel.findOne({ namespace })
  }

  async existsOrgByNamespace(namespace: string): Promise<boolean> {
    return this.orgModel.exists({ namespace })
  }

  async existsOrgById(id: string): Promise<boolean> {
    return this.orgModel.exists({ _id: id })
  }
}
