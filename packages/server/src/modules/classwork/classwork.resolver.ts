import { Args, ID, ResolveField, Resolver, Root } from '@nestjs/graphql'

import { CurrentOrg } from 'core'
import { ConversationService } from 'modules/conversation/conversation.service'
import {
  ConversationPageOptionInput,
  ConversationsPayload,
} from 'modules/conversation/conversation.type'
import { Org } from 'modules/org/models/Org'
import { ANY } from 'types'

import { Classwork, ClassworkType } from './models/Classwork'

@Resolver((_of) => Classwork)
export class ClassworkResolver {
  constructor(private readonly conversationService: ConversationService) {}

  /**
   *START CLASSWORK RESOLVER
   */

  // This needs to be edited
  @ResolveField((_returns) => [String])
  resolveType(value: { type: ClassworkType }): [...ANY] {
    if (value.type === ClassworkType.Material) {
      return ['ClassworkMaterial']
    }

    if (value.type === ClassworkType.Assignment) {
      return ['ClassworkAssignment']
    }

    return ['ClassworkMaterial', 'ClassworkAssignment']
  }

  @ResolveField((_returns) => ConversationsPayload)
  comments(
    @Root() { id },
    @CurrentOrg() org: Org,
    @Args('lastId', { type: () => ID, nullable: true }) lastId: string,
    @Args('conversationPageOptionInput')
    conversationPageOptionInput: ConversationPageOptionInput,
  ): Promise<ConversationsPayload> {
    return this.conversationService.listConversationByTargetId(
      conversationPageOptionInput,
      {
        orgId: org.id,
        lastId,
        roomId: id,
      },
    )
  }

  /**
   * END CLASSWORK RESOLVER
   */
}
