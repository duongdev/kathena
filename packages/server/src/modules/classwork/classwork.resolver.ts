import { Args, ID, ResolveField, Resolver, Root } from '@nestjs/graphql'

import { CurrentOrg } from 'core'
import { CommentService } from 'modules/comment/comment.service'
import {
  CommentPageOptionInput,
  CommentsPayload,
} from 'modules/comment/comment.type'
import { Org } from 'modules/org/models/Org'
import { ANY } from 'types'

import { Classwork, ClassworkType } from './models/Classwork'

@Resolver((_of) => Classwork)
export class ClassworkResolver {
  constructor(private readonly commentService: CommentService) {}

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

  @ResolveField((_returns) => CommentsPayload)
  comments(
    @Root() { id },
    @CurrentOrg() org: Org,
    @Args('lastId', { type: () => ID, nullable: true }) lastId: string,
    @Args('commentPageOptionInput')
    commentPageOptionInput: CommentPageOptionInput,
  ): Promise<CommentsPayload> {
    return this.commentService.listCommentByTargetId(commentPageOptionInput, {
      orgId: org.id,
      lastId,
      targetId: id,
    })
  }

  /**
   * END CLASSWORK RESOLVER
   */
}
