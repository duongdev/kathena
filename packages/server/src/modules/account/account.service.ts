import { DocumentType, ReturnModelType } from '@typegoose/typegoose'
import * as bcrypt from 'bcrypt'
import { uniq } from 'lodash'

import { Service, InjectModel, Logger } from 'core'
import { isObjectId } from 'core/utils/db'
import { Nullable } from 'types'

import { CreateAccountServiceInput } from './account.type'
import { Account } from './models/Account'

@Service()
export class AccountService {
  private readonly logger = new Logger(AccountService.name)

  constructor(
    @InjectModel(Account)
    private readonly accountModel: ReturnModelType<typeof Account>,
  ) {}

  async createAccount(
    accountInput: CreateAccountServiceInput,
  ): Promise<DocumentType<Account>> {
    this.logger.log(`[${this.createAccount.name}] Creating new account`)
    this.logger.verbose(accountInput)

    if (
      await this.accountModel.exists({
        orgId: accountInput.orgId,
        $or: [
          { username: accountInput.username },
          { email: accountInput.email },
        ],
      })
    ) {
      throw new Error(`Email or username has been taken`)
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
      createdAt: accountInput.createdByAccountId,
      status: accountInput.status,
      roles: uniq(accountInput.roles),
      displayName: accountInput.displayName,
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
  ): Promise<{ accounts: DocumentType<Account>[]; totalCount: number }> {
    const { orgId } = query
    const { limit, skip } = pageOptions

    const accounts = await this.accountModel
      .find({ orgId })
      .skip(skip)
      .limit(limit)

    const totalCount = await this.accountModel.countDocuments({ orgId })

    return { accounts, totalCount }
  }
}
