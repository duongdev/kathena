import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class NotificationPayload {
  @Field((_type) => String)
  title: string
}
