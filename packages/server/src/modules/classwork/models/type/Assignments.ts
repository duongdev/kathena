import { Field, ObjectType } from '@nestjs/graphql'
import { prop } from '@typegoose/typegoose'

import { Classwork } from '../Classwork'

@ObjectType({ implements: [Classwork] })
export class Assignments extends Classwork {
  @Field((_type) => Date)
  @prop({ type: Date, required: true })
  dueDate: Date
}
