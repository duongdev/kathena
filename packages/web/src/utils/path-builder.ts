import qs, { ParsedQuery, StringifiableRecord } from 'query-string'
import { useLocation } from 'react-router-dom'

export const LANDING_PAGE = `/`

export const SIGN_IN = `/auth/sign-in`
export const RESET_PWD = `/auth/reset-password`

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
export const UPDATE_ACADEMIC_COURSE = `${ACADEMIC_COURSES}/:id/update`
export const ACADEMIC_SUBJECT = `${ACADEMIC_SUBJECTS}/:id/detail`

export const TEACHING_MODULE = `${ORG_WORKSPACE}/teaching`
export const TEACHING_COURSES = `${TEACHING_MODULE}/courses`
export const TEACHING_COURSE_LIST = `${TEACHING_COURSES}`
export const TEACHING_COURSE = `${TEACHING_COURSES}/:id/detail`
export const TEACHING_COURSE_CLASSWORK_ASSIGNMENTS = `${TEACHING_COURSES}/:id/detail/classwork-assignments`
export const TEACHING_COURSE_CREATE_CLASSWORK_ASSIGNMENT = `${TEACHING_COURSES}/:id/classwork-assignments/create`
export const TEACHING_COURSE_CLASSWORK_MATERIALS = `${TEACHING_COURSES}/:id/detail/classwork-materials`
export const TEACHING_COURSE_CREATE_CLASSWORK_MATERIALS = `${TEACHING_COURSES}/:id/classwork-materials/create`

export const STUDYING_MODULE = `${ORG_WORKSPACE}/studying`
export const STUDYING_COURSES = `${STUDYING_MODULE}/courses`
export const STUDYING_COURSE_LIST = `${STUDYING_COURSES}`
export const STUDYING_COURSE = `${STUDYING_COURSES}/:id/detail`

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
