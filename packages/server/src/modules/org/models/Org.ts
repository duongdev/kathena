import { Field, ObjectType } from '@nestjs/graphql'
import { prop } from '@typegoose/typegoose'

import { BaseModel } from 'core'

@ObjectType({ implements: [BaseModel] })
export class Org extends BaseModel {
  @Field()
  @prop({
    index: true,
    unique: true,
  })
  namespace: string

  @Field()
  @prop()
  name: string
}
