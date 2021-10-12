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
import { Types } from 'mongoose'

import { CurrentOrg, Logger, UseAuthGuard } from 'core'
import pubSub from 'core/utils/pubSub'
import { Org } from 'modules/org/models/Org'
import { ANY } from 'types'

import { ConversationService } from './conversation.service'
import {
  ConversationPageOptionInput,
  ConversationsPayload,
  CreateConversationInput,
} from './conversation.type'
import { Conversation } from './model/Conversation'
import { NotificationPayload } from './notification.type'

@Resolver((_of) => Conversation)
export class ConversationResolver {
  private readonly logger = new Logger(ConversationResolver.name)

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
      payload.conversationCreated.roomId.toString() === variables.roomId,
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

  /**
   * NOTIFICATION
   */
  @Subscription((_returns) => NotificationPayload, {
    filter: (payload, variables) => {
      return payload.notification.accountIds.includes(
        Types.ObjectId(variables.targetId),
      )
    },
  })
  notification(
    @Args('targetId') _targetId: string,
  ): AsyncIterator<unknown, ANY, undefined> {
    return pubSub.asyncIterator('notification')
  }
}
