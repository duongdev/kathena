import qs, { ParsedQuery, StringifiableRecord } from 'query-string'
import { useLocation } from 'react-router-dom'

export const LANDING_PAGE = `/`

export const SIGN_IN = `/auth/sign-in`
export const RESET_PWD = `/auth/reset-password`
export const SET_PWD = `/auth/set-password`

export const ORG_WORKSPACE = `/app`

export const USER_LIST = `${ORG_WORKSPACE}/users`

export const USER_PROFILE = `${ORG_WORKSPACE}/profile/:username`
export const USER_SELF_SETTINGS = `${ORG_WORKSPACE}/account-settings`

export const ACADEMIC_MODULE = `${ORG_WORKSPACE}/academic`
export const ACADEMIC_SUBJECTS = `${ACADEMIC_MODULE}/subjects`
export const ACADEMIC_SUBJECT_LIST = `${ACADEMIC_SUBJECTS}`
export const CREATE_ACADEMIC_SUBJECT = `${ACADEMIC_SUBJECTS}/create`
export const UPDATE_ACADEMIC_SUBJECT = `${ACADEMIC_SUBJECTS}/:id/update`
export const ACADEMIC_COURSES = `${ACADEMIC_MODULE}/courses`
export const ACADEMIC_COURSE_LIST = `${ACADEMIC_COURSES}`
export const CREATE_ACADEMIC_COURSE = `${ACADEMIC_COURSES}/:idSubject/create`
export const CLONE_ACADEMIC_COURSE = `${ACADEMIC_COURSES}/:idCourse/clone`
export const UPDATE_ACADEMIC_COURSE = `${ACADEMIC_COURSES}/:id/update`
export const ACADEMIC_COURSE = `${ACADEMIC_COURSES}/:id/detail`
export const ACADEMIC_SUBJECT = `${ACADEMIC_SUBJECTS}/:id/detail`

export const TEACHING_MODULE = `${ORG_WORKSPACE}/teaching`
export const TEACHING_COURSES = `${TEACHING_MODULE}/courses`
export const TEACHING_COURSE_LIST = `${TEACHING_COURSES}`
export const TEACHING_COURSE = `${TEACHING_COURSES}/:id/detail`
export const TEACHING_COURSE_CLASSWORK_ASSIGNMENTS = `${TEACHING_COURSES}/:id/detail/classwork-assignments`
export const TEACHING_COURSE_CREATE_CLASSWORK_ASSIGNMENT = `${TEACHING_COURSES}/:id/classwork-assignments/create`
export const TEACHING_COURSE_CLASSWORK_ASSIGNMENT = `${TEACHING_COURSES}/classwork-assignments/:id/detail`
export const TEACHING_COURSE_CLASSWORK_MATERIALS = `${TEACHING_COURSES}/:id/detail/classwork-materials`
export const TEACHING_COURSE_CREATE_CLASSWORK_MATERIALS = `${TEACHING_COURSES}/:id/classwork-materials/create`
export const TEACHING_COURSE_DETAIL_CLASSWORK_MATERIALS = `${TEACHING_COURSES}/:id/classwork-materials/detail`
export const TEACHING_COURSE_DETAIL_CLASSWORK_SUBMISSIONS = `${TEACHING_COURSES}/:id/classwork-submissions/detail`
export const TEACHING_COURSE_QUIZZES = `${TEACHING_COURSES}/:id/detail/quizzes`
export const TEACHING_COURSE_CREATE_QUIZ = `${TEACHING_COURSES}/:id/quizzes/create`
export const TEACHING_COURSE_QUIZ = `${TEACHING_COURSES}/:id/quiz/detail`
export const TEACHING_COURSE_QUIZSUBMIT = `${TEACHING_COURSES}/:id/quiz-submit/detail`
export const TEACHING_COURSE_CLASSWORK_LESSONS = `${TEACHING_COURSES}/:id/detail/classwork-lessons`
export const TEACHING_COURSE_DETAIL_CLASSWORK_LESSON = `${TEACHING_COURSES}/classwork-lessons/:id/detail`
export const TEACHING_COURSE_CREATE_CLASSWORK_LESSON = `${TEACHING_COURSES}/:id/classwork-lesson/create`

export const STUDYING_MODULE = `${ORG_WORKSPACE}/studying`
export const STUDYING_COURSES = `${STUDYING_MODULE}/courses`
export const STUDYING_COURSE_LIST = `${STUDYING_COURSES}`
export const STUDYING_COURSE = `${STUDYING_COURSES}/:id/detail`
export const STUDYING_COURSE_CLASSWORK_ASSIGNMENTS = `${STUDYING_COURSES}/:id/detail/classwork-assignments`
export const STUDYING_COURSE_CLASSWORK_MATERIALS = `${STUDYING_COURSES}/:id/detail/classwork-materials`
export const STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_ASSIGNMENTS = `${STUDYING_COURSES}/:id/classwork-assignments/detail`
export const STUDYING_COURSE_DETAIL_SUBMISSION_CLASSWORK_ASSIGNMENTS = `${STUDYING_COURSES}/:id/classwork-submission/detail`
export const STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_MATERIALS = `${STUDYING_COURSES}/:id/classwork-material/detail`
export const STUDYING_COURSE_CREATE_SUBMISSION_CLASSWORK_ASSIGNMENTS = `${STUDYING_COURSES}/:id/classwork-assignments/Submission`
export const STUDYING_COURSE_LIST_OF_SUBMITTED_ASSIGNMENTS = `${STUDYING_COURSES}/:id/detail/list-of-submitted-assignments`
export const STUDYING_COURSE_CLASSWORK_LESSONS = `${STUDYING_COURSES}/:id/detail/classwork-lessons`
export const STUDYING_COURSE_DETAIL_CLASSWORK_LESSON = `${STUDYING_COURSES}/classwork-lessons/:id/detail`
export const STUDYING_COURSE_QUIZZES = `${STUDYING_COURSES}/:id/detail/quizzes`
export const STUDYING_COURSE_QUIZ = `${STUDYING_COURSES}/:id/quiz/detail`

export const ORG_SETTINGS = `${ORG_WORKSPACE}/org-settings`

export const buildPath = (
  path: string,
  params: { [key: string]: string } = {},
  query?: StringifiableRecord,
): string => {
  let result = path

  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, value)
  })

  if (query) {
    const queryString = qs.stringify(query)
    result += `?${queryString}`
  }

  return result
}

/** Parse query string from the URL/location to an object */
export const useQueryString = <Parsed = ParsedQuery<string>>(): Parsed => {
  const location = useLocation()
  const query = qs.parse(location.search)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return query as any
}
