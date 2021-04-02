import { Permission as P } from './models/Permission'
import { Role } from './models/Role'

export const staff: Role = {
  name: 'staff',
  priority: 3,
  permissions: [
    P.Hr_Access,
    P.Hr_CreateOrgAccount,
    P.Hr_ListOrgAccounts,
    P.Academic_CreateAcademicSubject,
    P.Academic_SetAcademicSubjectPublication,
    P.OrgOffice_ListOrgOffices,
  ],
}

export const student: Role = {
  name: 'student',
  priority: 4,
  permissions: [],
}

export const lecturer: Role = {
  name: 'lecturer',
  priority: 4,
  permissions: [],
}

export const admin: Role = {
  name: 'admin',
  priority: 2,
  permissions: [...staff.permissions, P.OrgOffice_CreateOrgOffice],
}

export const owner: Role = {
  name: 'owner',
  priority: 1,
  permissions: [...admin.permissions],
}

export const orgRoles = [owner, admin, staff, lecturer, student]
