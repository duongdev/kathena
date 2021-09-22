import { ClassworkAssignment } from 'graphql/generated'

export const getDescription = (
  assignment: Partial<ClassworkAssignment>,
  opts?: {
    uppercase?: boolean
    /** Don't append the "@" prefix on title. */
    noAtSign?: boolean

    forceAtSign?: boolean
  },
) => {
  let assignmentDescription =
    assignment.description ||
    `${opts?.noAtSign ? '' : '@'}${assignment.description}`

  if (opts?.uppercase) {
    assignmentDescription = assignmentDescription?.toUpperCase()
  }

  if (opts?.forceAtSign) {
    assignmentDescription = `@${assignmentDescription.replace(/^@+/, '')}`
  }

  return assignmentDescription || ''
}
export const getTitle = (
  assignment: Partial<ClassworkAssignment>,
  opts?: {
    noAtSign?: boolean
  },
) => {
  const assignmentTitle =
    assignment?.title || `${opts?.noAtSign ? '' : '@'}${assignment.title}`
  return assignmentTitle || ''
}

const useClassworkAssignmentUtils = () => ({ getDescription, getTitle })

export default useClassworkAssignmentUtils
