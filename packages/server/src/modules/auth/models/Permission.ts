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
  Academic_Course_Access = 'Academic_Course_Access',

  // Course
  Academic_CreateCourse = 'Academic_CreateCourse',
  Academic_UpdateCourse = 'Academic_UpdateCourse',
  Academic_ListCourses = 'Academic_ListCourses',
  Academic_AddStudentsToCourse = 'Academic_AddStudentsToCourse',
  Academic_AddLecturersToCourse = 'Academic_AddLecturersToCourse',
  Academic_RemoveStudentsFromCourse = 'Academic_RemoveStudentsFromCourse',
  Academic_RemoveLecturersFromCourse = 'Academic_RemoveLecturersFromCourse',

  // Lesson
  Academic_CreateLesson = 'Academic_CreateLesson',
  Academic_ListLesson = 'Academic_ListLesson',
  Academic_UpdateLesson = 'Academic_UpdateLesson',
  Academic_AddAbsentStudentsToLesson = 'Academic_AddAbsentStudentsToLesson',
  Academic_RemoveAbsentStudentsFromLesson = 'Academic_RemoveAbsentStudentsFromLesson',
  Academic_CommentsForTheLesson = 'Academic_CommentsForTheLesson',
  Academic_PublishAllLessons = 'Academic_PublishAllLessons',

  OrgOffice_Access = 'OrgOffice_Access',
  OrgOffice_CreateOrgOffice = 'OrgOffice_CreateOrgOffice',
  OrgOffice_ListOrgOffices = 'OrgOffice_ListOrgOffices',
  OrgOffice_UpdateOrgOffice = 'OrgOffice_UpdateOrgOffice',

  Teaching_Course_Access = 'Teaching_Course_Access',
  Studying_Course_Access = 'Studying_Course_Access',

  Classwork_ListClassworkAssignment = 'Classwork_ListClassworkAssignment',
  Classwork_CreateClassworkAssignment = 'Classwork_CreateClassworkAssignment',
  Classwork_UpdateClassworkAssignment = 'Classwork_UpdateClassworkAssignment',
  Classwork_SetClassworkAssignmentPublication = 'Classwork_SetClassworkAssignmentPublication',
  Classwork_AddAttachmentsToClassworkAssignment = 'Classwork_AddAttachmentsToClassworkAssignment',
  Classwork_RemoveAttachmentsFromClassworkAssignment = 'Classwork_RemoveAttachmentsFromClassworkAssignment',
  Classwork_AddVideoToClassworkAssignment = 'Classwork_AddVideoToClassworkAssignment',
  Classwork_RemoveVideoToClassworkAssignment = 'Classwork_RemoveVideoToClassworkAssignment',
  Classwork_PublishAllClassworkAssignments = 'Classwork_PublishAllClassworkAssignments',

  Classwork_ListClassworkMaterial = 'Classwork_ListClassworkMaterial',
  Classwork_UpdateClassworkMaterial = 'Classwork_UpdateClassworkMaterial',
  Classwork_CreateClassworkMaterial = 'Classwork_CreateClassworkMaterial',
  Classwork_SetClassworkMaterialPublication = 'Classwork_SetClassworkMaterialPublication',
  Classwork_AddAttachmentsToClassworkMaterial = 'Classwork_AddAttachmentsToClassworkMaterial',
  Classwork_RemoveAttachmentsFromClassworkMaterial = 'Classwork_RemoveAttachmentsFromClassworkMaterial',
  Classwork_SetGradeForClassworkSubmission = 'Classwork_SetGradeForClassworkSubmission',
  Classwork_AddVideoToClassworkMaterial = 'Classwork_AddVideoToClassworkMaterial',
  Classwork_RemoveVideoToClassworkMaterial = 'Classwork_RemoveVideoToClassworkMaterial',
  Classwork_PublishAlkClassworkMaterial = 'Classwork_PublishAllClassworkMaterial',

  Classwork_CreateClassworkSubmission = 'Classwork_CreateClassworkSubmission',
  Classwork_ListClassworkSubmission = 'Classwork_ListClassworkSubmission',
  Classwork_ShowSubmissionStatusList = 'Classwork_ShowSubmissionStatusList',
  Classwork_UpdateClassworkSubmission = 'Classwork_UpdateClassworkSubmission',

  AvgGradeStatisticsOfClassworkInTheCourse = 'AvgGradeStatisticsOfClassworkInTheCourse',

  Comment_CreateComment = 'Comment_CreateComment',

  Rating_CreateRating = 'Rating_CreateRating',

  /** For testing purpose */
  NoPermission = 'NoPermission',
}

registerEnumType(Permission, { name: 'Permission' })
