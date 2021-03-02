import { Field, ObjectType } from '@nestjs/graphql'
import { prop } from '@typegoose/typegoose'
import { IsEmail } from 'class-validator'
import { TypegooseModel } from 'core'

@ObjectType({ implements: [TypegooseModel] })
export class User extends TypegooseModel {
  @IsEmail()
  @prop({ required: true })
  @Field()
  email: string
}
