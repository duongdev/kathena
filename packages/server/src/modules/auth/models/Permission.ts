import { registerEnumType } from '@nestjs/graphql'

// ! KEEP THIS SORTED
export enum Permission {
  /** Access to HR module */
  Hr_Access = 'Hr_Access',
  /** Invite new member to org */
  Hr_CreateOrgAccount = 'Hr_CreateOrgAccount',
  Hr_ListOrgAccounts = 'Hr_ListOrgAccounts',
  Hr_UpdateOrgAccount = 'Hr_UpdateOrgAccount',

  Academic_CreateAcademicSubject = 'Academic_CreateAcademicSubject',
  Academic_ListAcademicSubjects = 'Academic_ListAcademicSubjects',
  Academic_SetAcademicSubjectPublication = 'Academic_SetAcademicSubjectPublication',

  OrgOffice_CreateOrgOffice = 'OrgOffice_CreateOrgOffice',

  /** For testing purpose */
  NoPermission = 'NoPermission',
}

registerEnumType(Permission, { name: 'Permission' })
