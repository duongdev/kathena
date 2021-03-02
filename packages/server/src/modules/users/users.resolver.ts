import { Mutation, Query, Resolver } from '@nestjs/graphql'
import { User } from './models/User'

@Resolver((_of) => User)
export class UserResolver {
  @Query((_returns) => [User])
  async users() {
    return []
  }

  @Mutation((_returns) => [User])
  async createUser() {
    return []
  }
}
