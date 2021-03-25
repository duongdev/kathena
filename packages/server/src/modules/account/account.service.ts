import { forwardRef, Inject } from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'
import * as bcrypt from 'bcrypt'
import { uniq } from 'lodash'
import { isValidObjectId } from 'mongoose'
import { ForbiddenError } from 'type-graphql'

import { Service, InjectModel, Logger } from 'core'
import { isObjectId } from 'core/utils/db'
import { removeExtraSpaces } from 'core/utils/string'
import { AuthService } from 'modules/auth/auth.service'
import { Permission } from 'modules/auth/models'
import { OrgService } from 'modules/org/org.service'
import { Nullable } from 'types'

import { CreateAccountServiceInput } from './account.type'
import { Account } from './models/Account'

@Service()
export class AccountService {
  private readonly logger = new Logger(AccountService.name)

  constructor(
    @InjectModel(Account)
    private readonly accountModel: ReturnModelType<typeof Account>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(forwardRef(() => OrgService))
    private readonly orgService: OrgService,
  ) {}

  async createAccount(
    accountInput: CreateAccountServiceInput,
  ): Promise<DocumentType<Account>> {
    this.logger.log(`[${this.createAccount.name}] Creating new account`)
    this.logger.verbose(accountInput)

    if (!(await this.orgService.validateOrgId(accountInput.orgId))) {
      throw new Error(`Org ID is invalid`)
    }

    if (
      await this.accountModel.exists({
        orgId: accountInput.orgId,
        email: accountInput.email,
      })
    ) {
      throw new Error(`Email ${accountInput.email} has been taken`)
    }
    if (
      await this.accountModel.exists({
        orgId: accountInput.orgId,
        username: accountInput.username,
      })
    ) {
      throw new Error(`Username ${accountInput.username} has been taken`)
    }

    // TODO: Throw error if orgId doesn't exist

    const account = await this.accountModel.create({
      username: accountInput.username,
      email: accountInput.email,
      password: bcrypt.hashSync(
        accountInput.password || accountInput.email,
        10,
      ),
      orgId: accountInput.orgId,
      createdBy: accountInput.createdByAccountId,
      status: accountInput.status,
      roles: uniq(accountInput.roles),
      displayName: removeExtraSpaces(accountInput.displayName),
    })

    this.logger.log(`[${this.createAccount.name}] Created account successfully`)
    this.logger.verbose(account.toObject())

    return account
  }

  async findAccountById(
    accountId: string,
  ): Promise<Nullable<DocumentType<Account>>> {
    return this.accountModel.findById(accountId)
  }

  async findAccountByUsernameOrEmail(args: {
    usernameOrEmail: string
    orgId: string
  }): Promise<Nullable<DocumentType<Account>>> {
    this.logger.log(
      `[${this.findAccountByUsernameOrEmail.name}] Finding account with username or email`,
    )
    this.logger.log(args)

    if (!(args.orgId && isObjectId(args.orgId) && args.usernameOrEmail)) {
      this.logger.verbose(
        `Neither orgId or usernameOrEmail are provided. Return null`,
      )
      this.logger.verbose(args)
      return null
    }

    const { orgId, usernameOrEmail } = args
    const account = await this.accountModel.findOne({
      orgId,
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    })

    if (!account) {
      this.logger.log(
        `[${this.findAccountByUsernameOrEmail.name}] Account not found`,
      )
      this.logger.log(args)

      return null
    }

    this.logger.log(`[${this.findAccountByUsernameOrEmail.name}] Found account`)
    this.logger.verbose(account.toJSON())

    return account
  }

  async findOneAccount({
    id,
    orgId,
  }: {
    id: string
    orgId: string
  }): Promise<Nullable<DocumentType<Account>>> {
    return this.accountModel.findOne({ _id: id, orgId })
  }

  async findAndPaginateAccounts(
    query: {
      orgId: string
    },
    pageOptions: {
      limit: number
      skip: number
    },
  ): Promise<{ accounts: DocumentType<Account>[]; count: number }> {
    const { orgId } = query
    const { limit, skip } = pageOptions

    const accounts = await this.accountModel
      .find({ orgId })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)

    const count = await this.accountModel.countDocuments({ orgId })

    return { accounts, count }
  }

  async createOrgMemberAccount(
    /** Account ID of the current account who performs action */
    creatorId: string,
    accountInput: CreateAccountServiceInput,
  ): Promise<DocumentType<Account>> {
    const targetAccountRoles = await this.authService.mapOrgRolesFromNames({
      orgId: accountInput.orgId,
      roleNames: accountInput.roles,
    })
    const canCreateMember = await this.authService.canAccountManageRoles(
      creatorId,
      targetAccountRoles,
    )

    if (!canCreateMember) {
      throw new Error('TARGET_ROLES_FORBIDDEN')
    }

    const createdAccount = await this.createAccount({
      ...accountInput,
      createdByAccountId: creatorId,
    })

    return createdAccount
  }

  async updateAccount(
    query: { id: string; orgId: string },
    update: {
      displayName?: string
      email?: string
      username?: string
      password?: string
    },
  ): Promise<DocumentType<Account>> {
    const account = await this.accountModel.findOne({
      _id: query.id,
      orgId: query.orgId,
    })

    if (!account) {
      throw new Error(`Couldn't find account to update`)
    }

    if (update.displayName) {
      account.displayName = removeExtraSpaces(update.displayName)
    }
    if (update.email) {
      account.email = update.email
    }
    if (update.username) {
      account.username = update.username
    }
    if (update.password) {
      account.password = bcrypt.hashSync(update.password, 10)
    }

    const updatedAccount = await account.save()

    return updatedAccount
  }

  async updateOrgMemberAccount(
    updaterId: string,
    query: { id: string; orgId: string },
    update: {
      displayName?: string
      email?: string
      username?: string
      password?: string
      roles?: string[]
    },
  ): Promise<DocumentType<Account>> {
    this.logger.log(`[updateOrgMemberAccount] start updating`)
    this.logger.verbose({ updaterId, query, update })

    const accountHasPermissionToUpdate = await this.authService.accountHasPermission(
      {
        accountId: updaterId,
        permission: Permission.Hr_UpdateOrgAccount,
      },
    )

    this.logger.verbose({ accountHasPermissionToUpdate })

    // Handle self-update
    if (updaterId === query.id && !accountHasPermissionToUpdate) {
      this.logger.verbose('Performing self-update')

      return this.updateAccount(query, {
        displayName: update.displayName,
        password: update.password,
      })
    }

    if (!accountHasPermissionToUpdate) {
      this.logger.error(
        `Not a self-update but doesn't have permission to update other accounts`,
      )
      throw new ForbiddenError()
    }

    const targetAccount = await this.accountModel.findOne({
      _id: query.id,
      orgId: query.orgId,
    })

    this.logger.verbose({ targetAccount })

    if (!targetAccount) {
      this.logger.error(
        `targetAccount ${query.id} not found in orgId ${query.orgId}`,
      )
      throw new Error(`Couldn't find account to update`)
    }

    const targetAccountRoles = await this.authService.mapOrgRolesFromNames({
      orgId: targetAccount.orgId,
      roleNames: targetAccount.roles,
    })

    this.logger.verbose({ targetAccountRoles })

    const canUpdateMember = await this.authService.canAccountManageRoles(
      updaterId,
      targetAccountRoles,
    )

    this.logger.verbose({ canUpdateMember })

    if (!canUpdateMember) {
      this.logger.error(`cannot update account with target roles`)
      this.logger.verbose({ targetAccountRoles })
      throw new ForbiddenError()
    }

    if (
      update.roles?.length &&
      (await this.authService.canAccountManageRoles(
        updaterId,
        await this.authService.mapOrgRolesFromNames({
          orgId: targetAccount.orgId,
          roleNames: update.roles,
        }),
      ))
    ) {
      this.logger.error(`wanted to update to permitted roles`)
      this.logger.verbose({ targetAccountRoles })
      throw new ForbiddenError()
    }

    return this.updateAccount(query, update)
  }
}
