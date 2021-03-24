import { join } from 'path'

import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ServeStaticModule } from '@nestjs/serve-static'
import { GraphQLError, GraphQLFormattedError } from 'graphql'
import { TypegooseModule } from 'nestjs-typegoose'

import { config } from 'core'
import { GraphQLUpload } from 'core/scalars/Upload'
import { AcademicModule } from 'modules/academic/academic.module'
import { AccountModule } from 'modules/account/account.module'
import { AuthModule } from 'modules/auth/auth.module'
import { DevtoolModule } from 'modules/devtool/devtool.module'
import { FileStorageModule } from 'modules/fileStorage/fileStorage.module'
import { OrgModule } from 'modules/org/org.module'

export const appModules = [
  AccountModule,
  AuthModule,
  DevtoolModule,
  OrgModule,
  AcademicModule,
  FileStorageModule,
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

    // GraphQLUpload,

    TypegooseModule.forRoot(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: true,
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: config.IS_PROD ? true : 'schema.gql',
      introspection: !config.IS_PROD,
      playground: !config.IS_PROD,
      formatError: (error: GraphQLError) => {
        const graphQLFormattedError: GraphQLFormattedError = {
          message:
            error.extensions?.exception?.response?.message || error.message,
        }
        return graphQLFormattedError
      },
      context: ({ req, connection }) =>
        connection
          ? {
              req: {
                ...connection.context,
                headers: {
                  authorization: connection.context?.authToken,
                },
              },
            }
          : { req },
    }),

    ...appModules,
  ],
})
export class AppModule {}
