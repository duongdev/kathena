import { join } from 'path'

import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { Module } from '@nestjs/common'

import { config } from 'core'

import { MailService } from './mail.service'

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: config.MAIL_HOST,
        secure: false,
        auth: {
          user: config.MAIL_USER,
          pass: config.MAIL_PASSWORD,
        },
      },
      defaults: {
        from: `"Kmin Academy" <${config.MAIL_FROM}>`,
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
