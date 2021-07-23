import { UsePipes, ValidationPipe } from '@nestjs/common'
import {
  Args,
  ID,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql'
import { DocumentType } from '@typegoose/typegoose'
import { PubSub } from 'graphql-subscriptions'

import { CurrentOrg, UseAuthGuard } from 'core'
import { Org } from 'modules/org/models/Org'
import { ANY } from 'types'

import { ConversationService } from './conversation.service'
import {
  ConversationPageOptionInput,
  ConversationsPayload,
  CreateConversationInput,
} from './conversation.type'
import { Conversation } from './model/Conversation'

const pubSub = new PubSub()
@Resolver((_of) => Conversation)
export class ConversationResolver {
  constructor(private readonly conversationService: ConversationService) {}

  @Mutation((_returns) => Conversation)
  @UseAuthGuard()
  @UsePipes(ValidationPipe)
  async createConversation(
    @CurrentOrg() org: Org,
    @Args('conversationInput') conversationInput: CreateConversationInput,
  ): Promise<DocumentType<Conversation>> {
    const conversation = await this.conversationService.createConversation(
      org.id,
      conversationInput,
    )
    pubSub.publish('conversationCreated', { conversationCreated: conversation })
    return conversation
  }

  @Subscription((_returns) => Conversation, {
    filter: (payload, variables) =>
      payload.conversationCreated.roomId === variables.roomId,
  })
  conversationCreated(
    @Args('roomId') _roomId: string,
  ): AsyncIterator<unknown, ANY, undefined> {
    return pubSub.asyncIterator('conversationCreated')
  }

  @Query((_returns) => ConversationsPayload)
  @UseAuthGuard()
  @UsePipes(ValidationPipe)
  conversations(
    @CurrentOrg() org: Org,
    @Args('roomId', { type: () => String }) roomId: string,
    @Args('lastId', { type: () => ID, nullable: true }) lastId: string,
    @Args('conversationPageOptionInput')
    conversationPageOptionInput: ConversationPageOptionInput,
  ): Promise<ConversationsPayload> {
    return this.conversationService.listConversationByTargetId(
      conversationPageOptionInput,
      {
        orgId: org.id,
        lastId,
        roomId,
      },
    )
  }
}
