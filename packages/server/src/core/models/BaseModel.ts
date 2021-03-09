import { Field, ID, InterfaceType } from '@nestjs/graphql'
import { modelOptions } from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

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
  orgId: string

  @Field()
  readonly createdAt: Date

  @Field()
  readonly updatedAt: Date
}
