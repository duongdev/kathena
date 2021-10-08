import { ReactNode, useMemo } from 'react'

import { Typography } from '@kathena/ui'
import { Permission } from 'graphql/generated'

import { useAuth } from './AuthContext'

export type RequiredPermissionProps = {
  permission: Permission
  children?: ((hasPermission: boolean) => ReactNode) | ReactNode
  showDeniedMessage?: boolean
}

export const RequiredPermission = (props: RequiredPermissionProps) => {
  const { permission, children, showDeniedMessage } = props
  const { permissions } = useAuth()
  const hasPermission = useMemo(
    () => permissions.includes(permission),
    [permission, permissions],
  )

  if (typeof children === 'function') {
    return children(hasPermission)
  }

  if (hasPermission) {
    return children
  }

  if (showDeniedMessage) {
    return <Typography>Bạn không có quyền {permission}</Typography>
  }

  return null
}
