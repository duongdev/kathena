import { Field, ID, InterfaceType } from '@nestjs/graphql'
import { modelOptions, prop } from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

import { ANY } from 'types'

/** Used to define a Typegoose model with default config. */
@modelOptions({
  schemaOptions: {
    timestamps: true,
    toJSON: {
      getters: true,
      virtuals: true,
      transform: (_doc: ANY, ret: ANY): void => {
        /* eslint-disable no-underscore-dangle */
        /* eslint-disable no-param-reassign */
        ret.id = ret._id
        delete ret._id
        /* eslint-enable */
      },
    },
  },
})
@InterfaceType()
export class BaseModel extends TimeStamps {
  @Field((_type) => ID)
  id: string

  @Field((_type) => ID)
  @prop({ type: Types.ObjectId })
  orgId: string

  @Field()
  readonly createdAt: Date

  @Field()
  readonly updatedAt: Date
}
