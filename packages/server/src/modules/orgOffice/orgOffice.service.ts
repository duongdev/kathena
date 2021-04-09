import { DocumentType, ReturnModelType } from '@typegoose/typegoose'
import { ForbiddenError } from 'type-graphql'

import { InjectModel, Logger, removeExtraSpaces, Service } from 'core'
import { AuthService } from 'modules/auth/auth.service'
import { P } from 'modules/auth/models'
import { OrgService } from 'modules/org/org.service'

import { OrgOffice } from './models/OrgOffice'

@Service()
export class OrgOfficeService {
  logger = new Logger(OrgOfficeService.name)

  constructor(
    @InjectModel(OrgOffice)
    private readonly orgOfficeModel: ReturnModelType<typeof OrgOffice>,
    private readonly orgService: OrgService,
    private readonly authService: AuthService,
  ) {}

  async createOrgOffice(input: {
    name: string
    address: string
    phone: string
    createdByAccountId: string
    orgId: string
  }): Promise<DocumentType<OrgOffice>> {
    this.logger.log(
      `${this.createOrgOffice.name} creating new org office ${input.name}`,
    )
    this.logger.verbose(input)

    const { name, address, phone, createdByAccountId, orgId } = input

    if (!(await this.orgService.validateOrgId(orgId))) {
      throw new Error('INVALID_ORG_ID')
    }

    if (
      !(await this.authService.accountHasPermission({
        accountId: createdByAccountId,
        permission: P.OrgOffice_CreateOrgOffice,
      }))
    ) {
      throw new ForbiddenError()
    }

    const orgOffice = await this.orgOfficeModel.create({
      name: removeExtraSpaces(name),
      address: removeExtraSpaces(address),
      phone: phone.replace(/\s/g, ''),
      orgId,
      createdByAccountId,
    })

    return orgOffice
  }

  async updateOrgOffice(input: {
    id: string
    name: string
    address: string
    phone: string
    updatedByAccountId: string
    orgId: string
  }): Promise<DocumentType<OrgOffice>> {
    const inputUpdate = { ...input }

    this.logger.log(
      `${this.updateOrgOffice.name} creating new org office ${inputUpdate.name}`,
    )
    this.logger.verbose(inputUpdate)

    if (!(await this.orgService.validateOrgId(inputUpdate.orgId))) {
      throw new Error('INVALID_ORG_ID')
    }

    if (
      !(await this.authService.accountHasPermission({
        accountId: inputUpdate.updatedByAccountId,
        permission: P.OrgOffice_UpdateOrgOffices,
      }))
    ) {
      throw new ForbiddenError()
    }

    const query = {
      /* eslint-disable no-underscore-dangle */
      _id: inputUpdate.id,
      orgId: inputUpdate.orgId,
    }

    const update = {
      name: removeExtraSpaces(inputUpdate.name),
      address: removeExtraSpaces(inputUpdate.address),
      phone: inputUpdate.phone.replace(/\s/g, ''),
      updatedByAccountId: inputUpdate.updatedByAccountId,
    }

    const orgOffice = await this.orgOfficeModel.findOneAndUpdate(
      query,
      update,
      { new: true },
    )

    if (!orgOffice) {
      throw new Error(`CAN'T_UPDATE_ORG_OFFICE`)
    }

    return orgOffice
  }

  async findOrgOfficesByOrgId(orgId: string): Promise<OrgOffice[]> {
    if (!(await this.orgService.validateOrgId(orgId))) {
      throw new Error('INVALID_ORG_ID')
    }

    return this.orgOfficeModel.find({ orgId })
  }
}
