import { Field, ObjectType } from '@nestjs/graphql'
import { index, prop } from '@typegoose/typegoose'

import { ClassworkMaterial } from './ClassworkMaterial'

@index({ title: 'text', type: 'text', publicationState: 'text' })
@ObjectType({ implements: [ClassworkMaterial] })
export class ClassworkAssignments extends ClassworkMaterial {
  @Field((_type) => Date)
  @prop({ type: Date, required: true })
  dueDate: Date
}
