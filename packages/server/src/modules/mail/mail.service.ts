import { MailerService } from '@nestjs-modules/mailer'
import { Injectable, Logger } from '@nestjs/common'

import { config } from 'core'
import { Account } from 'modules/account/models/Account'

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)

  constructor(private mailerService: MailerService) {}

  async sendNewClassworkAssignmentNotification(
    account: Account,
    courseName: string,
    classWorkId: string,
  ): Promise<boolean> {
    const { mailerService } = this

    const url = `${config.MAIL_DOMAIN}/app/studying/courses/${classWorkId}/classwork-assignments/detail`

    await mailerService
      .sendMail({
        to: account.email,
        subject: '[THÔNG BÁO] - Bài tập mới',
        template: './newClassworkAssignment',
        context: {
          name: account.username,
          courseName,
          url,
        },
      })
      .catch(() => {
        return false
      })

    return true
  }
}
