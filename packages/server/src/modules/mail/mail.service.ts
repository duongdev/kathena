import { MailerService } from '@nestjs-modules/mailer'
import { Injectable, Logger } from '@nestjs/common'

import { config } from 'core'
import { Account } from 'modules/account/models/Account'

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)

  constructor(private mailerService: MailerService) {}

  async sendNewClassworkNotification(
    account: Account,
    courseName: string,
    classWorkId: string,
  ) {
    const { mailerService } = this

    const url = `${config.APP_DOMAIN}/app/studying/courses/${classWorkId}/classwork-assignments/detail`

    this.logger.log(url)

    await mailerService.sendMail({
      to: `leminhnhat1133@gmail.com, huynhthanhcanh.top@gmail.com`,
      subject: 'Bài tập mới',
      template: './newClassworkAssignment',
      context: {
        name: account.username,
        courseName,
        url,
      },
    })
  }
}
