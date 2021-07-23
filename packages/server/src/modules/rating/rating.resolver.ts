import { forwardRef, Inject } from '@nestjs/common'
import { Resolver } from '@nestjs/graphql'

import { Logger } from 'core'

import { Rating } from './models/rating'
import { RatingService } from './rating.service'

@Resolver((_of) => Rating)
export class RatingResolver {
  private readonly logger = new Logger(RatingResolver.name)

  constructor(
    @Inject(forwardRef(() => RatingService))
    private readonly ratingService: RatingService,
  ) {}

  // TODO: [BE] Implement ratingService.createRating

  // TODO:[BE] Implement ratingService.calculateAvgRatingByTargetId
}
