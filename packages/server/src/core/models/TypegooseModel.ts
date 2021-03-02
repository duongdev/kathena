/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
import { Field, ID, InterfaceType } from '@nestjs/graphql'
import { modelOptions } from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

@modelOptions({
  schemaOptions: {
    timestamps: true,
    toJSON: {
      getters: true,
      virtuals: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id
        delete ret._id
      },
    },
  },
})
@InterfaceType()
export class TypegooseModel extends TimeStamps {
  @Field((_type) => ID)
  id: string

  @Field()
  readonly createdAt: Date

  @Field()
  readonly updatedAt: Date
}
