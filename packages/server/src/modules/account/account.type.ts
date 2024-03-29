import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql'
import { ArrayNotEmpty, IsEmail, IsOptional, MinLength } from 'class-validator'
import { FileUpload, GraphQLUpload } from 'graphql-upload'

import { OrgRoleName } from 'modules/auth/models'

import { Account, AccountStatus } from './models/Account'

@InputType()
export class CreateAccountInput {
  @Field()
  username: string

  @Field()
  @IsEmail()
  email: string

  @Field({ nullable: true })
  displayName?: string

  @Field((_type) => [String])
  @ArrayNotEmpty()
  roles: string[]
}

@InputType()
export class UpdateAccountInput {
  @Field({ nullable: true })
  @IsOptional()
  username?: string

  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string

  @Field({ nullable: true })
  @IsOptional()
  displayName?: string

  @Field((_type) => [String], { nullable: true })
  @ArrayNotEmpty()
  @IsOptional()
  roles?: OrgRoleName[]

  @Field({ nullable: true })
  @MinLength(6)
  @IsOptional()
  password?: string

  @Field((_type) => GraphQLUpload, { nullable: true })
  @IsOptional()
  avatar?: Promise<FileUpload>
}

export class CreateAccountServiceInput extends CreateAccountInput {
  orgId: string

  password?: string

  status?: AccountStatus

  createdByAccountId?: string
}

@ObjectType()
export class OrgAccountsPayload {
  @Field((_type) => [Account])
  accounts: Account[]

  @Field((_type) => Int)
  count: number
}

@InputType()
export class AccountsFilterInput {
  @Field((_type) => ID)
  orgId: string

  @Field((_type) => [String], { nullable: true })
  roles: OrgRoleName[]

  @Field({ nullable: true })
  searchText: string
}
