import { ClassworkMaterial } from 'graphql/generated'

export const getDisplayName = (
  material: Partial<ClassworkMaterial>,
  opts?: {
    uppercase?: boolean
    /** Don't append the "@" prefix on title. */
    noAtSign?: boolean

    forceAtSign?: boolean
  },
) => {
  let displayName =
    material.description ||
    `${opts?.noAtSign ? '' : '@'}${material.description}`

  if (opts?.uppercase) {
    displayName = displayName?.toUpperCase()
  }

  if (opts?.forceAtSign) {
    displayName = `@${displayName.replace(/^@+/, '')}`
  }

  return displayName || ''
}
export const getUserName = (
  material: Partial<ClassworkMaterial>,
  opts?: {
    noAtSign?: boolean
  },
) => {
  const title =
    material?.title || `${opts?.noAtSign ? '' : '@'}${material.title}`
  return title || ''
}

const useClassworkMaterialUtils = () => ({ getDisplayName, getUserName })

export default useClassworkMaterialUtils
