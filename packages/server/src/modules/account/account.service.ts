import { Scope } from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'

import { Service, InjectModel, Logger } from 'core'

import { CreateAccountInput } from './account.type'
import { Account } from './models/Account'

@Service({ scope: Scope.REQUEST })
export class AccountService {
  private readonly logger = new Logger(AccountService.name)

  constructor(
    @InjectModel(Account)
    private readonly accountModel: ReturnModelType<typeof Account>,
  ) {}

  async createAccount(
    accountInput: CreateAccountInput,
  ): Promise<DocumentType<Account>> {
    this.logger.log(`Creating new account`)
    this.logger.log(accountInput)

    const account = await this.accountModel.create({
      username: accountInput.username,
      email: accountInput.email,
      password: accountInput.password,
      orgId: accountInput.orgId,
      createdAt: accountInput.createdByAccountId,
    })

    this.logger.log(`Created account successfully`)
    this.logger.verbose(account.toObject())

    return account
  }
}
