/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { GraphQLError, GraphQLFormattedError } from 'graphql'
import { graphqlUploadExpress } from 'graphql-upload'

/** Wraps the GraphQLModule with an up-to-date graphql-upload middleware. */
@Module({})
export class GraphQLWithUploadModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(graphqlUploadExpress()).forRoutes('graphql')
  }

  static forRoot(): DynamicModule {
    return {
      module: GraphQLWithUploadModule,
      imports: [
        GraphQLModule.forRoot({
          autoSchemaFile: 'schema.gql',
          introspection: true,
          // playground: true,
          // uploads: false,
          path: '/graphql',
          installSubscriptionHandlers: true,
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
      ],
    }
  }
}
