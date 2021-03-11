import { registerEnumType } from '@nestjs/graphql'

// ! KEEP THIS SORTED
export enum Permission {
  /** Access to HR module */
  Hr_Access = 'Hr_Access',
  /** Invite new member to org */
  Hr_CreateAccount = 'Hr_CreateAccount',
}

registerEnumType(Permission, { name: 'Permission' })
