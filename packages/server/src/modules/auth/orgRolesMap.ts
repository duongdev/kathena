import { Permission as P } from './models/Permission'
import { Role } from './models/Role'

export const staff: Role = {
  name: 'staff',
  priority: 3,
  permissions: [
    P.Hr_Access,
    P.Hr_CreateOrgAccount,
    P.Hr_ListOrgAccounts,
    P.Hr_UpdateOrgAccountStatus,
    P.Academic_CreateAcademicSubject,
    P.Academic_ListAcademicSubjects,
    P.Academic_SetAcademicSubjectPublication,
    P.Academic_UpdateAcademicSubject,
    P.Academic_ListCourses,
    P.Academic_UpdateCourse,
    P.Academic_CreateCourse,
    P.Academic_AddLecturersToCourse,
    P.OrgOffice_ListOrgOffices,
    P.OrgOffice_CreateOrgOffice,
    P.OrgOffice_UpdateOrgOffice,
  ],
}

export const student: Role = {
  name: 'student',
  priority: 4,
  permissions: [P.Academic_ListAcademicSubjects],
}

export const lecturer: Role = {
  name: 'lecturer',
  priority: 4,
  permissions: [P.Academic_ListAcademicSubjects],
}

export const admin: Role = {
  name: 'admin',
  priority: 2,
  permissions: [
    ...staff.permissions,
    P.OrgOffice_CreateOrgOffice,
    P.OrgOffice_UpdateOrgOffice,
  ],
}

export const owner: Role = {
  name: 'owner',
  priority: 1,
  permissions: [...admin.permissions],
}

export const orgRoles = [owner, admin, staff, lecturer, student]
