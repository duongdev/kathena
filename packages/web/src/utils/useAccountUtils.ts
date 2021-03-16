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

const useAccountUtils = () => ({ getDisplayName })

export default useAccountUtils
