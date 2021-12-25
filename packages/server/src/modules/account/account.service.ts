/* eslint-disable no-process-env */
import { forwardRef, Inject } from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'
import * as bcrypt from 'bcrypt'
import { uniq } from 'lodash'
import { ForbiddenError } from 'type-graphql'

import { Service, InjectModel, Logger } from 'core'
import { isObjectId } from 'core/utils/db'
import {
  generateString,
  removeExtraSpaces,
  stringWithoutSpecialCharacters,
} from 'core/utils/string'
import { AuthService } from 'modules/auth/auth.service'
import { OrgRoleName, Permission } from 'modules/auth/models'
import { FileStorageService } from 'modules/fileStorage/fileStorage.service'
import { MailService } from 'modules/mail/mail.service'
import { OrgService } from 'modules/org/org.service'
import { ANY, Nullable } from 'types'

import { OTP_TIME } from './account.const'
import { CreateAccountServiceInput, UpdateAccountInput } from './account.type'
import { Account, AccountStatus } from './models/Account'

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
    @Inject(forwardRef(() => MailService))
    private readonly mailService: MailService,
    @Inject(forwardRef(() => FileStorageService))
    private readonly fileStorageService: FileStorageService,
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

    if (!stringWithoutSpecialCharacters(accountInput.displayName)) {
      throw new Error('displayName contains invalid characters')
    }

    const otp = generateString(20)

    const otpExpired = new Date()
    otpExpired.setMinutes(otpExpired.getMinutes() + OTP_TIME)

    const account = await this.accountModel.create({
      username: accountInput.username,
      email: accountInput.email,
      password: bcrypt.hashSync(
        accountInput.password || accountInput.email,
        10,
      ),
      otp,
      otpExpired,
      orgId: accountInput.orgId,
      createdBy: accountInput.createdByAccountId,
      status: accountInput.status,
      roles: uniq(accountInput.roles),
      displayName: removeExtraSpaces(accountInput.displayName),
    })

    if (process.env.NODE_ENV !== 'test') {
      this.mailService
        .sendOTP(account, 'ACTIVE_ACCOUNT')
        .then(() => this.logger.log('Send mail success!'))
    }
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
    pageOptions: {
      limit: number
      skip: number
    },
    filter: {
      orgId: string
      searchText?: string
      roles?: OrgRoleName[]
    },
  ): Promise<{ accounts: DocumentType<Account>[]; count: number }> {
    const { orgId, searchText, roles } = filter
    const { limit, skip } = pageOptions
    const accountModel = this.accountModel.find({
      orgId,
    })
    if (searchText) {
      const search = removeExtraSpaces(filter.searchText)
      if (search !== undefined && search !== '') {
        accountModel.find({
          $text: { $search: search },
        })
      }
    }
    if (roles) {
      const arrQueryRoles: ANY = []
      roles.map((role) => {
        return arrQueryRoles.push({
          roles: role,
        })
      })
      accountModel.find({
        $or: arrQueryRoles,
      })
    }
    accountModel.sort({ _id: -1 }).skip(skip).limit(limit)
    const accounts = await accountModel
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
    update: UpdateAccountInput,
  ): Promise<DocumentType<Account>> {
    const account = await this.accountModel.findOne({
      _id: query.id,
      orgId: query.orgId,
    })

    if (!account) {
      throw new Error(`Couldn't find account to update`)
    }

    if (update.displayName) {
      const newDisplayName = removeExtraSpaces(update.displayName)
      if (newDisplayName) account.displayName = newDisplayName
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
    if (update.roles) {
      account.roles = update.roles
    }

    if (update.avatar) {
      const image = await this.fileStorageService.uploadFile(
        query.orgId,
        account.id,
        update.avatar,
      )

      account.avatar = image.id
    }

    const updatedAccount = await account.save()

    return updatedAccount
  }

  async updateOrgMemberAccount(
    updaterId: string,
    query: { id: string; orgId: string },
    update: UpdateAccountInput,
  ): Promise<DocumentType<Account>> {
    this.logger.log(`[updateOrgMemberAccount] start updating`)
    this.logger.verbose({ updaterId, query, update })

    // Handle self-update
    if (updaterId === query.id) {
      this.logger.verbose('Performing self-update')

      return this.updateAccount(query, {
        displayName: update.displayName,
        password: update.password,
        avatar: update.avatar,
      })
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
      !(await this.authService.canAccountManageRoles(
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

    return this.updateAccount(query, {
      displayName: update.displayName,
      password: update.password,
      email: update.email,
      username: update.username,
      roles: update.roles,
    })
  }

  async updateOrgMemberAccountStatus(
    updaterId: string,
    query: { id: string; orgId: string },
    status: AccountStatus,
  ): Promise<DocumentType<Account>> {
    const accountHasPermissionToUpdate =
      await this.authService.accountHasPermission({
        accountId: updaterId,
        permission: Permission.Hr_UpdateOrgAccountStatus,
      })

    if (updaterId === query.id) {
      throw new Error(`Can't change activate/deactivate status by yourself`)
    }

    if (!accountHasPermissionToUpdate) {
      throw new ForbiddenError()
    }

    const targetAccount = await this.accountModel.findOne({
      _id: query.id,
      orgId: query.orgId,
    })

    if (!targetAccount) {
      throw new Error(`Couldn't find account to update`)
    }

    const targetAccountRoles = await this.authService.mapOrgRolesFromNames({
      orgId: targetAccount.orgId,
      roleNames: targetAccount.roles,
    })

    const canUpdateMember = await this.authService.canAccountManageRoles(
      updaterId,
      targetAccountRoles,
    )

    if (!canUpdateMember) {
      throw new ForbiddenError()
    }

    targetAccount.status = status

    const updateAccount = await targetAccount.save()

    return updateAccount
  }

  async setPassword(
    usernameOrEmail: string,
    password: string,
    otp: string,
  ): Promise<DocumentType<Account>> {
    const account = await this.accountModel.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    })

    if (!account) {
      throw new Error('Account not found')
    }
    const current = new Date()
    if (account.status === AccountStatus.Deactivated) {
      throw new Error('Account has been deactivated')
    }
    if (account.otp !== otp) {
      throw new Error('OTP invalid')
    }
    if (account.otpExpired.getTime() < current.getTime()) {
      throw new Error('OTP expired')
    }

    if (account.status === AccountStatus.Pending) {
      account.status = AccountStatus.Active
    }
    account.otp = ''
    account.otpExpired = new Date(current.setHours(current.getHours() - 1))
    account.password = bcrypt.hashSync(password, 10)
    const afterAccount = await account.save()

    return afterAccount
  }

  async callOTP(
    usernameOrEmail: string,
    type: 'ACTIVE_ACCOUNT' | 'RESET_PASSWORD',
  ): Promise<DocumentType<Account>> {
    const account = await this.accountModel.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    })

    if (!account) {
      throw new Error('Account not found')
    }
    if (account.status === AccountStatus.Deactivated) {
      throw new Error('Account has been deactivated')
    }
    const current = new Date()
    if (account.otpExpired.getTime() > current.getTime()) {
      throw new Error(
        `Don't spam, please try again after ${account.otpExpired.getHours()}:${account.otpExpired.getMinutes()}`,
      )
    }
    const otp = generateString(20)
    const otpExpired = new Date()
    otpExpired.setMinutes(otpExpired.getMinutes() + OTP_TIME)
    account.otp = otp
    account.otpExpired = otpExpired

    const afterAccount = await account.save()

    if (process.env.NODE_ENV !== 'test') {
      this.mailService
        .sendOTP(afterAccount, type)
        .then(() => this.logger.log('Send mail success!'))
    }

    return afterAccount
  }
}
