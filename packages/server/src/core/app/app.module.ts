import { join } from 'path'

import { Module } from '@nestjs/common'
import { ServeStaticModule } from '@nestjs/serve-static'
import { TypegooseModule } from 'nestjs-typegoose'

import { config } from 'core'
import { AcademicModule } from 'modules/academic/academic.module'
import { AccountModule } from 'modules/account/account.module'
import { AuthModule } from 'modules/auth/auth.module'
import { ClassworkModule } from 'modules/classwork/classwork.module'
import { ConversationModule } from 'modules/conversation/conversation.module'
import { DevtoolModule } from 'modules/devtool/devtool.module'
import { FileStorageModule } from 'modules/fileStorage/fileStorage.module'
import { MailModule } from 'modules/mail/mail.module'
import { OrgModule } from 'modules/org/org.module'
import { OrgOfficeModule } from 'modules/orgOffice/orgOffice.module'
import { RatingModule } from 'modules/rating/rating.module'

import { GraphQLWithUploadModule } from './graphql-with-upload.module'

export const appModules = [
  ...(config.ENABLE_DEVTOOL_MODULE ? [DevtoolModule] : []),
  AccountModule,
  AuthModule,
  OrgModule,
  AcademicModule,
  FileStorageModule,
  OrgOfficeModule,
  ClassworkModule,
  ConversationModule,
  MailModule,
  RatingModule,
]

@Module({
  imports: [
    ...(config.IS_PROD
      ? [
          ServeStaticModule.forRoot({
            rootPath: join(__dirname, '../../../../web', 'build'),
          }),
        ]
      : []),

    TypegooseModule.forRoot(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: true,
    }),
    // GraphQLModule.forRoot({
    //   autoSchemaFile: config.IS_PROD ? true : 'schema.gql',
    //   introspection: !config.IS_PROD,
    //   playground: !config.IS_PROD,
    //   uploads: false,
    //   formatError: (error: GraphQLError) => {
    //     const graphQLFormattedError: GraphQLFormattedError = {
    //       message:
    //         error.extensions?.exception?.response?.message || error.message,
    //     }
    //     return graphQLFormattedError
    //   },
    //   context: ({ req, connection }) =>
    //     connection
    //       ? {
    //           req: {
    //             ...connection.context,
    //             headers: {
    //               authorization: connection.context?.authToken,
    //             },
    //           },
    //         }
    //       : { req },
    // }),
    GraphQLWithUploadModule.forRoot(),

    ...appModules,
  ],
})
export class AppModule {}
