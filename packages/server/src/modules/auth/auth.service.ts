import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { UnauthorizedError } from 'type-graphql'

import { config, Logger, Service } from 'core'
import { AccountService } from 'modules/account/account.service'
import { Account } from 'modules/account/models/Account'
import { OrgService } from 'modules/org/org.service'

@Service()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly accountService: AccountService,
    private readonly orgService: OrgService,
  ) {}

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

  async signAccountToken(
    account: Pick<Account, 'id' | 'orgId' | 'username' | 'password' | 'email'>,
  ): Promise<string> {
    const token = jwt.sign(
      {
        id: account.id,
        orgId: account.orgId,
        username: account.username,
        password: account.password,
        email: account.email,
      },
      config.JWT_SECRET,
    )

    return token
  }
}
