/* eslint-disable react/jsx-props-no-spreading */
import { ComponentType, FC } from 'react'

import { Redirect } from 'react-router-dom'

import { ANY, OBJECT } from '@kathena/types'
import { Spinner, Typography } from '@kathena/ui'
import { AccountStatus } from 'graphql/generated'
import { buildPath, SIGN_IN } from 'utils/path-builder'

import { useAuth } from './AuthContext'

export type WithAuthOptions = {}

export type WithAuthProps = {
  options?: WithAuthOptions
}

export const WithAuth: FC<WithAuthProps> = ({ children }) => {
  const { account, loading } = useAuth()

  if (loading) {
    return <Spinner center p={1} />
  }

  if (!account) {
    return (
      <>
        <Redirect
          to={buildPath(SIGN_IN, {}, { redirect: window.location.href })}
        />
        <Typography>Redirecting...</Typography>
      </>
    )
  }

  if (account.status === AccountStatus.Deactivated) {
    return <Typography>Tài khoản của bạn đã bị khoá</Typography>
  }

  if (account.status === AccountStatus.Pending) {
    return <Typography>Tài khoản của bạn chưa được kích hoạt</Typography>
  }

  return children as ANY
}

export const withAuth = <Props extends OBJECT>(authProps?: {
  options?: WithAuthOptions
}) => (BaseComponent: ComponentType<Props>) => (props: Props) => (
  <WithAuth {...authProps}>
    <BaseComponent {...props} />
  </WithAuth>
)
