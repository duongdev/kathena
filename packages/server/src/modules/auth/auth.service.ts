import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { keyBy, uniq } from 'lodash'
import { UnauthorizedError } from 'type-graphql'

import { config, Logger, Service } from 'core'
import { AccountService } from 'modules/account/account.service'
import { Account } from 'modules/account/models/Account'
import { OrgService } from 'modules/org/org.service'

import { AuthData } from './auth.type'
import { Permission } from './models/Permission'
import { Role } from './models/Role'
import { orgRoles } from './orgRolesMap'

@Service()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly accountService: AccountService,
    private readonly orgService: OrgService,
  ) {}

  /** Returns json web token if success */
  async signIn(args: {
    usernameOrEmail: string
    password: string
    orgNamespace: string
  }): Promise<string> {
    this.logger.log(`[${this.signIn.name}] Signing in`)
    this.logger.verbose(args)

    const { usernameOrEmail, password, orgNamespace } = args

    const org = await this.orgService.findOrgByNamespace(orgNamespace)

    if (!org) {
      this.logger.log(
        `[${this.signIn.name}] orgNamespace ${orgNamespace} doesn't exist`,
      )
      throw new Error(`Organization namespace ${orgNamespace} doesn't exist`)
    }

    const account = await this.accountService.findAccountByUsernameOrEmail({
      usernameOrEmail,
      orgId: org.id,
    })

    if (!account) {
      this.logger.log(`[${this.signIn.name}] Account not found`)
      throw new UnauthorizedError()
    }

    if (!bcrypt.compareSync(password, account.password)) {
      this.logger.log(`[${this.signIn.name}] Wrong password`)
      throw new UnauthorizedError()
    }

    const token = await this.signAccountToken(account)

    return token
  }

  /** Signs some account's data into json web token */
  async signAccountToken(
    account: Pick<Account, 'id' | 'orgId'>,
  ): Promise<string> {
    const authData: AuthData = {
      accountId: account.id,
      orgId: account.orgId,
    }
    const token = jwt.sign(authData, config.JWT_SECRET)

    return token
  }

  /** Returns a list of roles of an org */
  async getOrgRoles(_orgId: string): Promise<Role[]> {
    return orgRoles
  }

  /** Returns all account's permissions */
  async getAccountPermissions(accountId: string): Promise<Permission[]> {
    const account = await this.accountService.findAccountById(accountId)

    if (!account) return []

    const accountOrgRoles = keyBy(await this.getOrgRoles(account.orgId), 'name')

    const permissions: Permission[] = uniq(
      account.roles.reduce(
        (permissionValues: Permission[], role) =>
          permissionValues.concat(accountOrgRoles[role].permissions),
        [],
      ),
    )

    return permissions
  }

  /** Checks whether that account has that permission */
  async accountHasPermission({
    accountId,
    permission,
  }: {
    accountId: string
    permission: string
  }): Promise<boolean> {
    const accountPermissions = (await this.getAccountPermissions(
      accountId,
    )) as string[]

    return accountPermissions.includes(permission)
  }
}
