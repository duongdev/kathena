import { Field, InputType, Int } from '@nestjs/graphql'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ANY = any
export type TODO = ANY
// eslint-disable-next-line @typescript-eslint/ban-types
export type OBJECT = object
export type Maybe<T> = T | null
export type Nullable<T> = Maybe<T>

@InputType()
export class PageOptionsInput {
  @Field((_type) => Int)
  skip: number

  @Field((_type) => Int)
  limit: number
}
