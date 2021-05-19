import { Account } from 'graphql/generated'

export const getDisplayName = (
  account: Partial<Account>,
  opts?: {
    uppercase?: boolean
    /** Don't append the "@" prefix on username. */
    noAtSign?: boolean

    forceAtSign?: boolean
  },
) => {
  let displayName =
    account?.displayName || `${opts?.noAtSign ? '' : '@'}${account.username}`

  if (opts?.uppercase) {
    displayName = displayName?.toUpperCase()
  }

  if (opts?.forceAtSign) {
    displayName = `@${displayName.replace(/^@+/, '')}`
  }

  return displayName || ''
}
export const getUserName = (
  account: Partial<Account>,
  opts?: {
    noAtSign?: boolean
  },
) => {
  const username =
    account?.username || `${opts?.noAtSign ? '' : '@'}${account.username}`
  return username || ''
}

const useAccountUtils = () => ({ getDisplayName, getUserName })

export default useAccountUtils
