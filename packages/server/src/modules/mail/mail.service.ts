import { MailerService } from '@nestjs-modules/mailer'
import { Injectable, Logger } from '@nestjs/common'

import { config } from 'core'
import { Account } from 'modules/account/models/Account'

import { signatureImgUrl } from './mail.const'

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
          signatureImg: `${signatureImgUrl}/kmin-signature.png`,
        },
      })
      .catch(() => {
        return false
      })

    return true
  }

  async sendOTP(
    account: Account,
    type: 'ACTIVE_ACCOUNT' | 'RESET_PASSWORD',
  ): Promise<boolean> {
    const { mailerService } = this
    const { email, username, otp, otpExpired } = account

    const url = `${config.MAIL_DOMAIN}/auth/set-password?otp=${otp}`

    const subject =
      type === 'ACTIVE_ACCOUNT'
        ? '[TÀI KHOẢN] - Kích hoạt tài khoản'
        : '[TÀI KHOẢN] - Lấy lại mật khẩu'
    const template =
      type === 'ACTIVE_ACCOUNT' ? './activeAccount' : './resetPassword'
    const otpExpiredTime = `${otpExpired.getHours()}h${otpExpired.getMinutes()}p ngày ${otpExpired.getUTCDate()} tháng ${
      otpExpired.getUTCMonth() + 1
    } năm ${otpExpired.getFullYear()}`

    await mailerService
      .sendMail({
        to: email,
        subject,
        template,
        context: {
          name: username,
          url,
          otpExpiredTime,
          signatureImg: `${signatureImgUrl}/kmin-signature.png`,
        },
      })
      .catch(() => {
        return false
      })

    return true
  }
}
