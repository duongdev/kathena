import { Field, ObjectType } from '@nestjs/graphql'
import { index, prop } from '@typegoose/typegoose'

import { GRADE_MIN } from '../classwork.const'

import { Classwork, ClassworkType } from './Classwork'

@index({
  title: 'text',
  description: 'text',
  publicationState: 'text',
})
@ObjectType()
export class ClassworkAssignment extends Classwork {
  @Field((_type) => Date, { nullable: true })
  @prop({ type: Date, default: null })
  dueDate: Date

  @Field()
  @prop({ required: true, default: ClassworkType.Assignment })
  type: string

  @Field()
  @prop({ default: GRADE_MIN })
  maxScores: number

  @Field()
  @prop({ default: false })
  haveSubmission: boolean
}
