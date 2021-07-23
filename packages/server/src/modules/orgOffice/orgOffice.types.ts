import { Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsOptional, IsPhoneNumber } from 'class-validator'

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

@InputType()
export class UpdateOrgOfficeInput {
  @Field({ nullable: true })
  @IsOptional()
  name?: string

  @Field({ nullable: true })
  @IsOptional()
  address?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsPhoneNumber('VN')
  phone?: string
}
