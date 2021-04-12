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
