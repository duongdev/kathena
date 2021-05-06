import { Field, ObjectType, registerEnumType } from '@nestjs/graphql'
import { prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

import { Classwork } from '../Classwork'

@ObjectType({ implements: [Classwork] })
export class Assignments extends Classwork {
  @Field((_type) => Date)
  @prop({ type: Date, required: true })
  dueDate: Date
}
