import { Field, ObjectType } from '@nestjs/graphql'
import { prop } from '@typegoose/typegoose'

import { ClassworkMaterial } from './ClassworkMaterial'

@ObjectType({ implements: [ClassworkMaterial] })
export class ClassworkAssignments extends ClassworkMaterial {
  @Field((_type) => Date)
  @prop({ type: Date, required: true })
  dueDate: Date
}
