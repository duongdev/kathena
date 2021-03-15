import { OnApplicationBootstrap } from '@nestjs/common'
import { DocumentType } from '@typegoose/typegoose'
import { uniq } from 'lodash'

import { config, Logger, Service } from 'core'
import { AccountService } from 'modules/account/account.service'
import { Account, AccountStatus } from 'modules/account/models/Account'
import { owner } from 'modules/auth/orgRolesMap'
import { Org } from 'modules/org/models/Org'
import { OrgService } from 'modules/org/org.service'

@Service()
export class DevtoolService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DevtoolService.name)

  constructor(
    private readonly accountService: AccountService,
    private readonly orgService: OrgService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log(this.onApplicationBootstrap.name)
    return this.kminBootstrap()
  }

  /** Creates org & first admin user */
  async kminBootstrap(): Promise<void> {
    const kminOrgConfig = {
      orgName: 'Kmin Academy',
      orgNamespace: 'kmin-edu',
      adminUsername: 'duongdev',
      adminEmail: 'dustin.do95@gmail.com',
      adminPassword: config.INIT_ADMIN_PWD,
      adminName: 'Dương Đỗ',
      adminRoles: [owner.name],
    }

    this.logger.log(
      `[${this.kminBootstrap.name}] Running bootstrap for kmin org`,
    )
    this.logger.verbose(kminOrgConfig)

    const org: DocumentType<Org> =
      (await this.orgService.findOrgByNamespace(kminOrgConfig.orgNamespace)) ||
      (await this.orgService.createOrg({
        name: kminOrgConfig.orgName,
        namespace: kminOrgConfig.orgNamespace,
      }))

    const account: DocumentType<Account> =
      (await this.accountService.findAccountByUsernameOrEmail({
        orgId: org.id,
        usernameOrEmail: kminOrgConfig.adminUsername,
      })) ||
      (await this.accountService.createAccount({
        orgId: org.id,
        email: kminOrgConfig.adminEmail,
        username: kminOrgConfig.adminUsername,
        displayName: kminOrgConfig.adminName,
        password: kminOrgConfig.adminPassword,
        status: AccountStatus.Active,
        roles: kminOrgConfig.adminRoles,
      }))

    await org.updateOne(
      {
        $set: {
          name: kminOrgConfig.orgName,
          namespace: kminOrgConfig.orgNamespace,
        },
      },
      { new: true },
    )
    await account.updateOne(
      {
        $set: {
          email: kminOrgConfig.adminEmail,
          username: kminOrgConfig.adminUsername,
          status: AccountStatus.Active,
          displayName: kminOrgConfig.adminName,
          roles: uniq([...account.roles, ...kminOrgConfig.adminRoles]),
        },
      },
      { new: true },
    )

    this.logger.log(
      `[${this.kminBootstrap.name}] Initialized Kmin org successfully`,
    )
  }
}
