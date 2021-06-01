import { forwardRef, Inject } from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'

import { Service, InjectModel, Logger } from 'core'
import { OrgService } from 'modules/org/org.service'

import { CreateCommentInput } from './comment.type'
import { Comment } from './model/Comment'

@Service()
export class CommentService {
  private readonly logger = new Logger(CommentService.name)

  constructor(
    @InjectModel(Comment)
    private readonly commentModel: ReturnModelType<typeof Comment>,

    @Inject(forwardRef(() => OrgService))
    private readonly orgService: OrgService,
  ) {}

  async createComment(
    orgId: string,
    commentInput: CreateCommentInput,
  ): Promise<DocumentType<Comment>> {
    const { createdByAccountId, targetId, content } = commentInput

    if (!(await this.orgService.validateOrgId(orgId))) {
      throw new Error(`Org ID is invalid`)
    }

    const comment = this.commentModel.create({
      createdByAccountId,
      orgId,
      targetId,
      content,
    })

    return comment
  }

  // TODO: Implement commentService.listCommentByTargetId
}
