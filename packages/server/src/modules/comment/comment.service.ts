import { ReturnModelType } from '@typegoose/typegoose'

import { Service, InjectModel, Logger } from 'core'

import { Comment } from './model/Comment'

@Service()
export class CommentService {
  private readonly logger = new Logger(CommentService.name)

  constructor(
    @InjectModel(Comment)
    private readonly commentModel: ReturnModelType<typeof Comment>,
  ) {}

  // TODO: Implement commentService.createComment

  // TODO: Implement commentService.listCommentByTargetId
}
