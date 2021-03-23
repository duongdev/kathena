import { forwardRef, Inject } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { isUndefined, keyBy, uniq } from 'lodash'
import { rejects } from 'node:assert'

import { config, Logger, Service } from 'core'
import { AccountService } from 'modules/account/account.service'
import { Account } from 'modules/account/models/Account'
import { Org } from 'modules/org/models/Org'
import { OrgService } from 'modules/org/org.service'

import { AuthData } from './auth.type'
import { Permission } from './models/Permission'
import { Role } from './models/Role'
import { orgRoles } from './orgRolesMap'

@Service()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    @Inject(forwardRef(() => AccountService))
    private readonly accountService: AccountService,
    private readonly orgService: OrgService,
  ) {}

  /** Returns json web token if success */
  async signIn(args: {
    usernameOrEmail: string
    password: string
    orgNamespace: string
  }): Promise<{
    token: string
    account: Account
    org: Org
    permissions: Permission[]
  }> {
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
      throw new Error('INVALID_CREDENTIALS')
    }

    if (!bcrypt.compareSync(password, account.password)) {
      this.logger.log(`[${this.signIn.name}] Wrong password`)
      throw new Error('INVALID_CREDENTIALS')
    }

    const token = await this.signAccountToken(account)
    const permissions = await this.getAccountPermissions(account.id)

    return { token, account, org, permissions }
  }

  /** Signs some account's data into json web token */
  async signAccountToken(
    account: Pick<Account, 'id' | 'orgId'>,
  ): Promise<string> {
    if (!account.id) {
      throw new Error(`ACCOUNT_ID_NOT_FOUND`)
    }
    if (!account.orgId) {
      throw new Error(`nothing orgId`)
    }
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

  async mapOrgRolesFromNames({
    orgId,
    roleNames,
  }: {
    orgId: string
    roleNames: string[]
  }): Promise<Role[]> {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const orgRoles = await this.getOrgRoles(orgId)

    const roles = roleNames
      .map((role) => orgRoles.find((roleItem) => roleItem.name === role))
      .filter((role) => !!role) as Role[]

    return roles
  }

  async getAccountRoles(accountId: string): Promise<Role[]> {
    const account = await this.accountService.findAccountById(accountId)

    if (!account) {
      return []
    }

    const accountOrgRoles = await this.getOrgRoles(account.orgId)
    const accountRoles = account.roles
      .map((role) => accountOrgRoles.find((roleItem) => roleItem.name === role))
      .filter((role) => !!role) as Role[]

    return accountRoles
  }

  /** Check if an account has permission to manage other roles */
  async canAccountManageRoles(
    accountId: string,
    roles: Role[],
  ): Promise<boolean> {
    const accountRoles = await this.getAccountRoles(accountId)

    const accountTopPriorityRole = accountRoles.reduce(
      (current, role) => Math.min(current, role.priority),
      Infinity,
    )

    const targetRoleTopPriority = roles.reduce(
      (current, role) => Math.min(current, role.priority),
      Infinity,
    )

    return accountTopPriorityRole < targetRoleTopPriority
  }
}
