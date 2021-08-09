import { forwardRef, Inject } from '@nestjs/common'
import { ReturnModelType, DocumentType } from '@typegoose/typegoose'

import { Service, InjectModel, Logger } from 'core'
import { OrgService } from 'modules/org/org.service'

import { Rating } from './models/rating'
import { RatingInput } from './rating.type'

@Service()
export class RatingService {
  private readonly logger = new Logger(RatingService.name)

  constructor(
    @InjectModel(Rating)
    private readonly ratingModel: ReturnModelType<typeof Rating>,

    @Inject(forwardRef(() => OrgService))
    private readonly orgService: OrgService,
  ) {}

  async createRating(
    orgId: string,
    createdByAccountId: string,
    ratingInput: RatingInput,
  ): Promise<DocumentType<Rating>> {
    const { targetId, numberOfStars } = ratingInput

    const rating = await this.ratingModel.findOne({
      targetId,
      createdByAccountId,
    })

    if (rating) {
      rating.numberOfStars = numberOfStars

      const update = await rating.save()
      return update
    }

    const createRating = this.ratingModel.create({
      createdByAccountId,
      orgId,
      targetId,
      numberOfStars,
    })

    return createRating
  }

  async calculateAvgRatingByTargetId(
    orgId: string,
    targetId: string,
  ): Promise<number> {
    const listRating = await this.ratingModel.find({
      targetId,
      orgId,
    })

    let sum = 0
    let avgRating = 0

    if (listRating.length > 0) {
      const listRatingMap = listRating.map(async (rating) => {
        sum += rating.numberOfStars
      })

      await Promise.all(listRatingMap).then(() => {
        avgRating = sum / listRating.length
      })
    }
    return Math.round(avgRating * 10) / 10
  }
}
