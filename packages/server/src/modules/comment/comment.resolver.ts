import { Resolver } from '@nestjs/graphql'

import { CommentService } from './comment.service'

@Resolver((_of) => CommentService)
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  // TODO: Implement createComment resolver
}
