import { ReactNode, useMemo } from 'react'

import { Typography } from '@kathena/ui'
import { useCanAccountManageRolesQuery } from 'graphql/generated'

export type RequiredManageRolesProps = {
  roles: string[]
  children?: ((canManageRoles: boolean) => ReactNode) | ReactNode
  showDeniedMessage?: boolean
}

export const RequiredManageRoles = (props: RequiredManageRolesProps) => {
  const { roles, children, showDeniedMessage } = props

  const { data } = useCanAccountManageRolesQuery({
    variables: {
      roles,
    },
  })

  const canManageRoles = useMemo(() => {
    if (data?.canAccountManageRoles) return data?.canAccountManageRoles
    return false
  }, [data])

  if (typeof children === 'function') {
    return children(canManageRoles)
  }

  if (canManageRoles) {
    return children
  }

  if (showDeniedMessage) {
    return (
      <Typography>Bạn không có quyền quản lí {roles.join(', ')}</Typography>
    )
  }

  return null
}
