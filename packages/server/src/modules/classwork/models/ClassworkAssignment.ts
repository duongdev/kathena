import { Field, ObjectType } from '@nestjs/graphql'
import { index, prop } from '@typegoose/typegoose'

import { Classwork, ClassworkType } from './Classwork'

@index({ title: 'text', type: 'text', publicationState: 'text' })
@ObjectType()
export class ClassworkAssignment extends Classwork {
  @Field((_type) => Date)
  @prop({ type: Date, required: true })
  dueDate: Date

  @Field()
  @prop({ required: true, default: ClassworkType.Assignment })
  type: string
}
