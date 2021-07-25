import { ReturnModelType } from '@typegoose/typegoose'

import { Service, InjectModel, Logger } from 'core'

import { Rating } from './models/rating'

@Service()
export class RatingService {
  private readonly logger = new Logger(RatingService.name)

  constructor(
    @InjectModel(Rating)
    private readonly ratingModel: ReturnModelType<typeof Rating>,
  ) {}

  // TODO: [BE] Implement ratingService.createRating

  // TODO:[BE] Implement ratingService.calculateAvgRatingByTargetId
}
