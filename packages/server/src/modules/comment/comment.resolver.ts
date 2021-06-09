import { UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { DocumentType } from '@typegoose/typegoose'

import { CurrentOrg, UseAuthGuard } from 'core'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'

import { CommentService } from './comment.service'
import {
  CommentPageOptionInput,
  CommentsPayload,
  CreateCommentInput,
} from './comment.type'
import { Comment } from './model/Comment'

@Resolver((_of) => Comment)
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  @Mutation((_returns) => Comment)
  @UseAuthGuard(P.Comment_CreateComment)
  @UsePipes(ValidationPipe)
  async createComment(
    @CurrentOrg() org: Org,
    @Args('commentInput') commentInput: CreateCommentInput,
  ): Promise<DocumentType<Comment>> {
    return this.commentService.createComment(org.id, commentInput)
  }

  @Query((_returns) => CommentsPayload)
  @UseAuthGuard(P.Comment_CreateComment)
  @UsePipes(ValidationPipe)
  comments(
    @CurrentOrg() org: Org,
    @Args('targetId', { type: () => ID }) targetId: string,
    @Args('lastId', { type: () => ID, nullable: true }) lastId: string,
    @Args('commentPageOptionInput')
    commentPageOptionInput: CommentPageOptionInput,
  ): Promise<CommentsPayload> {
    return this.commentService.listCommentByTargetId(commentPageOptionInput, {
      orgId: org.id,
      lastId,
      targetId,
    })
  }
}
