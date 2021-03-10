import { join } from 'path'

import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ServeStaticModule } from '@nestjs/serve-static'
import { TypegooseModule } from 'nestjs-typegoose'

import { config } from 'core'
import { AccountModule } from 'modules/account/account.module'
import { AuthModule } from 'modules/auth/auth.module'
import { DevtoolModule } from 'modules/devtool/devtool.module'
import { OrgModule } from 'modules/org/org.module'

const appModules = [AccountModule, AuthModule, DevtoolModule, OrgModule]

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
    GraphQLModule.forRoot({
      autoSchemaFile: config.IS_PROD ? true : 'schema.gql',
      introspection: !config.IS_PROD,
      playground: !config.IS_PROD,
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
