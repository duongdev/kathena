import { forwardRef, Inject, UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { DocumentType } from '@typegoose/typegoose'

import { CurrentAccount, CurrentOrg, Logger, UseAuthGuard } from 'core'
import { Account } from 'modules/account/models/Account'
import { P } from 'modules/auth/models'
import { Org } from 'modules/org/models/Org'

import { Rating } from './models/Rating'
import { RatingService } from './rating.service'
import { RatingInput } from './rating.type'

@Resolver((_of) => Rating)
export class RatingResolver {
  private readonly logger = new Logger(RatingResolver.name)

  constructor(
    @Inject(forwardRef(() => RatingService))
    private readonly ratingService: RatingService,
  ) {}

  @Mutation((_returns) => Rating)
  @UseAuthGuard(P.Rating_CreateRating)
  @UsePipes(ValidationPipe)
  async createRatingForTheLesson(
    @CurrentOrg() org: Org,
    @CurrentAccount() account: Account,
    @Args('ratingInput') ratingInput: RatingInput,
  ): Promise<DocumentType<Rating>> {
    return this.ratingService.createRatingForTheLesson(
      org.id,
      account.id,
      ratingInput,
    )
  }
}
