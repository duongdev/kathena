import { ClassworkMaterial } from 'graphql/generated'

export const getDescription = (
  material: Partial<ClassworkMaterial>,
  opts?: {
    uppercase?: boolean
    /** Don't append the "@" prefix on title. */
    noAtSign?: boolean

    forceAtSign?: boolean
  },
) => {
  let materialDescription =
    material.description ||
    `${opts?.noAtSign ? '' : '@'}${material.description}`

  if (opts?.uppercase) {
    materialDescription = materialDescription?.toUpperCase()
  }

  if (opts?.forceAtSign) {
    materialDescription = `@${materialDescription.replace(/^@+/, '')}`
  }

  return materialDescription || ''
}
export const getTitle = (
  material: Partial<ClassworkMaterial>,
  opts?: {
    noAtSign?: boolean
  },
) => {
  const materialTitle =
    material?.title || `${opts?.noAtSign ? '' : '@'}${material.title}`
  return materialTitle || ''
}

const useClassworkMaterialUtils = () => ({ getDescription, getTitle })

export default useClassworkMaterialUtils
