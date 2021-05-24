import { Field, ObjectType } from '@nestjs/graphql'
import { index, prop } from '@typegoose/typegoose'

import { Classwork, ClassworkType } from './Classwork'

@index({
  title: 'text',
  description: 'text',
  publicationState: 'text',
})
@ObjectType()
export class ClassworkMaterial extends Classwork {
  @Field()
  @prop({ required: true, default: ClassworkType.Material })
  type: string
}
