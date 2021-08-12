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
    P.Academic_AddStudentsToCourse,
    P.Academic_AddLecturersToCourse,
    P.Academic_RemoveStudentsFromCourse,
    P.Academic_RemoveLecturersFromCourse,
    P.Academic_AcademicSubject_Access,
    P.Academic_Course_Access,
    P.Academic_CreateLesson,
    P.Academic_ListLesson,
    P.Academic_UpdateLesson,
    P.Academic_AddAbsentStudentsToLesson,
    P.Academic_RemoveAbsentStudentsFromLesson,
    P.Classwork_ListClassworkAssignment,
    P.Classwork_ListClassworkMaterial,
    P.Classwork_CreateClassworkAssignment,
    P.Classwork_SetClassworkAssignmentPublication,
    P.Classwork_UpdateClassworkAssignment,
    P.Comment_CreateComment,
    P.Rating_CreateRating,
    P.AvgGradeStatisticsOfClassworkInTheCourse,
  ],
}

export const student: Role = {
  name: 'student',
  priority: 4,
  permissions: [
    P.Academic_ListAcademicSubjects,
    P.Studying_Course_Access,
    P.Classwork_ListClassworkAssignment,
    P.Classwork_ListClassworkMaterial,
    P.Comment_CreateComment,
    P.Academic_ListLesson,
    P.Rating_CreateRating,
    P.Classwork_CreateClassworkSubmission,
    P.Classwork_ListClassworkSubmission,
  ],
}

export const lecturer: Role = {
  name: 'lecturer',
  priority: 4,
  permissions: [
    P.Academic_ListAcademicSubjects,
    P.Classwork_CreateClassworkMaterial,
    P.Teaching_Course_Access,
    P.Classwork_ListClassworkAssignment,
    P.Classwork_ListClassworkMaterial,
    P.Classwork_CreateClassworkAssignment,
    P.Classwork_SetClassworkAssignmentPublication,
    P.Classwork_UpdateClassworkAssignment,
    P.Classwork_UpdateClassworkMaterial,
    P.Classwork_SetClassworkMaterialPublication,
    P.Classwork_AddAttachmentsToClassworkAssignment,
    P.Classwork_AddAttachmentsToClassworkMaterial,
    P.Classwork_RemoveAttachmentsFromClassworkAssignment,
    P.Classwork_RemoveAttachmentsFromClassworkMaterial,
    P.Classwork_SetGradeForClassworkSubmission,
    P.Classwork_ShowSubmissionStatusList,
    P.Academic_CreateLesson,
    P.Academic_ListLesson,
    P.Academic_UpdateLesson,
    P.Academic_AddAbsentStudentsToLesson,
    P.Academic_RemoveAbsentStudentsFromLesson,
    P.Academic_CommentsForTheLesson,
    P.Comment_CreateComment,
    P.Rating_CreateRating,
    P.Classwork_ListClassworkSubmission,
    P.AvgGradeStatisticsOfClassworkInTheCourse,
  ],
}

export const admin: Role = {
  name: 'admin',
  priority: 2,
  permissions: [
    ...staff.permissions,
    P.OrgOffice_Access,
    P.OrgOffice_ListOrgOffices,
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
