import { forwardRef, Inject } from '@nestjs/common'
import { ReturnModelType, DocumentType } from '@typegoose/typegoose'
import { ForbiddenError } from 'type-graphql'

import { Service, InjectModel, Logger } from 'core'
import { AuthService } from 'modules/auth/auth.service'
import { Lesson } from 'modules/lesson/models/Lesson'
import { Nullable } from 'types'

import { Rating } from './models/Rating'
import { RolesCanSubmitRatingForLesson } from './rating.const'
import { RatingInput } from './rating.type'

@Service()
export class RatingService {
  private readonly logger = new Logger(RatingService.name)

  constructor(
    @InjectModel(Rating)
    private readonly ratingModel: ReturnModelType<typeof Rating>,

    @InjectModel(Lesson)
    private readonly lessonModel: ReturnModelType<typeof Lesson>,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  /**
   * START GENERAL
   */

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
      await this.calculateAvgRatingByTargetId(
        orgId,
        targetId,
        numberOfStars,
        rating,
      )
      rating.numberOfStars = numberOfStars

      const update = await rating.save()
      return update
    }

    const createRating = await this.ratingModel.create({
      createdByAccountId,
      orgId,
      targetId,
      numberOfStars,
    })

    await this.calculateAvgRatingByTargetId(orgId, targetId, numberOfStars)

    return createRating
  }

  /**
   * END GENERAL
   */

  async createRatingForTheLesson(
    orgId: string,
    createdByAccountId: string,
    ratingInput: RatingInput,
  ): Promise<DocumentType<Rating>> {
    if (
      !(await this.authService.canSubmitRating(
        createdByAccountId,
        RolesCanSubmitRatingForLesson,
      ))
    ) {
      throw new ForbiddenError()
    }

    const createRating = await this.createRating(
      orgId,
      createdByAccountId,
      ratingInput,
    )

    return createRating
  }

  async findOneRating(
    accountId: string,
    targetId: string,
    orgId: string,
  ): Promise<Nullable<DocumentType<Rating>>> {
    return this.ratingModel.findOne({
      orgId,
      targetId,
      createdByAccountId: accountId,
    })
  }

  async calculateAvgRatingByTargetId(
    orgId: string,
    targetId: string,
    newStar: number,
    rating?: Rating,
  ): Promise<number> {
    const countRating = await this.ratingModel.countDocuments({
      targetId,
      orgId,
    })

    const lesson = await this.lessonModel.findOne({
      _id: targetId,
      orgId,
    })

    if (!lesson) {
      throw new Error('Lesson not found')
    }

    let currentSumNumberOfStars = 0
    let newSum = 0
    let avgRating = 0

    if (rating) {
      currentSumNumberOfStars = Math.round(
        lesson.avgNumberOfStars * countRating,
      )
      newSum = currentSumNumberOfStars - rating.numberOfStars + newStar
    } else {
      currentSumNumberOfStars = Math.round(
        lesson.avgNumberOfStars * (countRating - 1),
      )
      newSum = currentSumNumberOfStars + newStar
    }
    avgRating = newSum / countRating

    lesson.avgNumberOfStars = avgRating
    await lesson.save()

    return avgRating
  }
}
