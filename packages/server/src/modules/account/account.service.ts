import { DocumentType, ReturnModelType } from '@typegoose/typegoose'
import * as bcrypt from 'bcrypt'

import { Service, InjectModel, Logger } from 'core'
import { Nullable } from 'types'

import { CreateAccountInput } from './account.type'
import { Account } from './models/Account'

@Service()
export class AccountService {
  private readonly logger = new Logger(AccountService.name)

  constructor(
    @InjectModel(Account)
    private readonly accountModel: ReturnModelType<typeof Account>,
  ) {}

  async createAccount(
    accountInput: CreateAccountInput,
  ): Promise<DocumentType<Account>> {
    this.logger.log(`[${this.createAccount.name}] Creating new account`)
    this.logger.verbose(accountInput)

    // TODO: Check if email or username existing

    const account = await this.accountModel.create({
      username: accountInput.username,
      email: accountInput.email,
      password: bcrypt.hashSync(accountInput.password, 10),
      orgId: accountInput.orgId,
      createdAt: accountInput.createdByAccountId,
      status: accountInput.status,
    })

    this.logger.log(`[${this.createAccount.name}] Created account successfully`)
    this.logger.verbose(account.toObject())

    return account
  }

  async findAccountByUsernameOrEmail(args: {
    usernameOrEmail: string
    orgId: string
  }): Promise<Nullable<DocumentType<Account>>> {
    this.logger.log(
      `[${this.findAccountByUsernameOrEmail.name}] Finding account with username or email`,
    )
    this.logger.log(args)

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
}
