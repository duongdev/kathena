import { Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsPhoneNumber } from 'class-validator'

@InputType()
export class CreateOrgOfficeInput {
  @Field()
  @IsNotEmpty()
  name: string

  @Field()
  @IsNotEmpty()
  address: string

  @Field()
  @IsPhoneNumber('VN')
  phone: string
}
