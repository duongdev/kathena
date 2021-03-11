import { Field, ObjectType } from '@nestjs/graphql'

import { Permission } from './Permission'

export type OrgRoleName = 'owner' | 'admin' | 'staff' | 'lecturer' | 'student'

@ObjectType()
export class Role {
  @Field()
  name: OrgRoleName

  @Field((_type) => [Permission])
  permissions: Permission[]
}
