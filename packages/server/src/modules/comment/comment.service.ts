import { forwardRef, Inject } from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'

import { Service, InjectModel, Logger } from 'core'
import { OrgService } from 'modules/org/org.service'

import { CommentPageOptionInput } from './comment.type'
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

  // TODO: Implement commentService.createComment

  // TODO: Implement commentService.listCommentByTargetId
  async listCommentByTargetId(
    commentPageOptionInput: CommentPageOptionInput,
    filter: {
      orgId: string
      lastId?: string
      targetId: string
    },
  ): Promise<{ comments: DocumentType<Comment>[]; count: number }> {
    const { limit } = commentPageOptionInput
    const { orgId, lastId, targetId } = filter

    if (!(await this.orgService.validateOrgId(orgId)))
      throw new Error('ORG_ID_INVALID')

    const getComments = this.commentModel.find({
      targetId,
    })

    if (lastId) {
      getComments.find({
        $and: [
          {
            _id: {
              $lt: lastId,
            },
          },
        ],
      })
    }

    getComments.sort({ _id: -1 }).limit(limit)
    const comments = await getComments
    const count = await this.commentModel.countDocuments({ orgId, targetId })

    return { comments, count }
  }
}
