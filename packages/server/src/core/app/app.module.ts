import { Module } from '@nestjs/common'
import { config } from 'core'
import { TypegooseModule } from 'nestjs-typegoose'
import { GraphQLModule } from '@nestjs/graphql'
import { UsersModule } from 'modules/users/users.module'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'

const appModules = [UsersModule]

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../../../web', 'build'),
    }),

    TypegooseModule.forRoot(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: true,
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: config.nodeEnv === 'production' ? true : 'schema.gql',
      introspection: true,
    }),

    ...appModules,
  ],
})
export class AppModule {}
