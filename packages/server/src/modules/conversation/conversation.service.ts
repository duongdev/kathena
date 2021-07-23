import { forwardRef, Inject } from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'

import { Service, InjectModel, Logger } from 'core'
import { OrgService } from 'modules/org/org.service'

import {
  ConversationPageOptionInput,
  CreateConversationInput,
} from './conversation.type'
import { Conversation } from './model/Conversation'

@Service()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name)

  constructor(
    @InjectModel(Conversation)
    private readonly conversationModel: ReturnModelType<typeof Conversation>,

    @Inject(forwardRef(() => OrgService))
    private readonly orgService: OrgService,
  ) {}

  async createConversation(
    orgId: string,
    conversationInput: CreateConversationInput,
  ): Promise<DocumentType<Conversation>> {
    const { createdByAccountId, roomId, content, type } = conversationInput

    if (!(await this.orgService.validateOrgId(orgId))) {
      throw new Error(`Org ID is invalid`)
    }

    const conversation = this.conversationModel.create({
      createdByAccountId,
      orgId,
      roomId,
      content,
      type,
    })

    return conversation
  }

  async listConversationByTargetId(
    conversationPageOptionInput: ConversationPageOptionInput,
    filter: {
      orgId: string
      lastId?: string
      roomId: string
    },
  ): Promise<{ conversations: DocumentType<Conversation>[]; count: number }> {
    const { limit } = conversationPageOptionInput
    const { orgId, lastId, roomId } = filter

    if (!(await this.orgService.validateOrgId(orgId)))
      throw new Error('ORG_ID_INVALID')

    const getConversations = this.conversationModel.find({
      roomId,
    })

    if (lastId) {
      getConversations.find({
        $and: [
          {
            _id: {
              $lt: lastId,
            },
          },
        ],
      })
    }

    getConversations.sort({ _id: -1 }).limit(limit)
    const conversations = await getConversations
    const count = await this.conversationModel.countDocuments({ orgId, roomId })

    return { conversations, count }
  }
}
