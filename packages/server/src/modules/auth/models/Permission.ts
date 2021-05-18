import { registerEnumType } from '@nestjs/graphql'

// ! KEEP THIS SORTED
export enum Permission {
  /** Access to HR module */
  Hr_Access = 'Hr_Access',
  /** Invite new member to org */
  Hr_CreateOrgAccount = 'Hr_CreateOrgAccount',
  Hr_ListOrgAccounts = 'Hr_ListOrgAccounts',
  Hr_UpdateOrgAccount = 'Hr_UpdateOrgAccount',
  Hr_UpdateOrgAccountStatus = 'Hr_UpdateOrgAccountStatus',

  Academic_AcademicSubject_Access = 'Academic_AcademicSubject_Access',
  Academic_CreateAcademicSubject = 'Academic_CreateAcademicSubject',
  Academic_ListAcademicSubjects = 'Academic_ListAcademicSubjects',
  Academic_SetAcademicSubjectPublication = 'Academic_SetAcademicSubjectPublication',
  Academic_UpdateAcademicSubject = 'Academic_UpdateAcademicSubject',

  OrgOffice_Access = 'OrgOffice_Access',
  OrgOffice_CreateOrgOffice = 'OrgOffice_CreateOrgOffice',
  OrgOffice_ListOrgOffices = 'OrgOffice_ListOrgOffices',
  OrgOffice_UpdateOrgOffice = 'OrgOffice_UpdateOrgOffice',

  Classwork_AddAttachmentsToClassworkAssignment = 'Classwork_AddAttachmentsToClassworkAssignment',
  Classwork_AddAttachmentsToClassworkMaterial = 'Classwork_AddAttachmentsToClassworkMaterial',
  Classwork_RemoveAttachmentsFromClassworkAssignment = 'Classwork_RemoveAttachmentsFromClassworkAssignment',
  Classwork_RemoveAttachmentsFromClassworkMaterial = 'Classwork_RemoveAttachmentsFromClassworkMaterial',

  Academic_Course_Access = 'Academic_Course_Access',
  Academic_CreateCourse = 'Academic_CreateCourse',
  Academic_UpdateCourse = 'Academic_UpdateCourse',
  Academic_ListCourses = 'Academic_ListCourses',
  Academic_AddStudentsToCourse = 'Academic_AddStudentsToCourse',
  Academic_AddLecturersToCourse = 'Academic_AddLecturersToCourse',
  Academic_RemoveStudentsFromCourse = 'Academic_RemoveStudentsFromCourse',
  Academic_RemoveLecturersFromCourse = 'Academic_RemoveLecturersFromCourse',
  Teaching_Course_Access = 'Teaching_Course_Access',
  Studying_Course_Access = 'Studying_Course_Access',
  Classwork_CreateClassworkAssignment = 'Classwork_CreateClassworkAssignment',

  /** For testing purpose */
  NoPermission = 'NoPermission',
}

registerEnumType(Permission, { name: 'Permission' })
