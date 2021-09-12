/* eslint-disable react/jsx-props-no-spreading */
import { FC, useMemo } from 'react'

import { makeStyles, Skeleton } from '@material-ui/core'
import clsx from 'clsx'

import { Typography, TypographyProps } from '@kathena/ui'
import { Account, useAccountDisplayNameQuery } from 'graphql/generated'
import useAccountUtils from 'utils/useAccountUtils'

export type AccountDisplayNameWithId = {
  accountId: string
}

export type AccountDisplayNameWithAccount = {
  account: Pick<Account, 'id' | 'username' | 'displayName'>
}

export type AccountDisplayNameProps = { maxWidth?: number } & TypographyProps &
  (AccountDisplayNameWithId | AccountDisplayNameWithAccount)

const AccountDisplayName: FC<AccountDisplayNameProps> = (props) => {
  const { className, maxWidth, ...TypoProps } = props
  const { accountId } = props as AccountDisplayNameWithId
  const { account: accountProp } = props as AccountDisplayNameWithAccount

  const classes = useStyles(props)
  const { getDisplayName } = useAccountUtils()
  const { data, loading } = useAccountDisplayNameQuery({
    variables: { id: accountId },
    skip: !!accountProp,
  })

  const account = useMemo(
    () => accountProp || data?.account,
    [accountProp, data?.account],
  )
  const displayName = useMemo(
    () => (account ? getDisplayName(account) : ''),
    [account, getDisplayName],
  )

  if (loading) return <Skeleton variant="text" className={classes.skeleton} />

  return (
    <Typography
      className={clsx(className, classes.root)}
      style={{ maxWidth }}
      noWrap
      title={displayName}
      {...TypoProps}
    >
      {displayName}
    </Typography>
  )
}

export const useAccountDisplayName = (accountId: string) => {
  const { getDisplayName } = useAccountUtils()
  const { data } = useAccountDisplayNameQuery({
    variables: { id: accountId },
  })

  const account = useMemo(() => data?.account, [data?.account])
  const displayName = useMemo(
    () => (account ? getDisplayName(account) : ''),
    [account, getDisplayName],
  )

  return displayName
}

const useStyles = makeStyles(() => ({
  root: {
    fontWeight: 'bold',
    cursor: 'default',
    maxWidth: 250,
    overflow: 'hidden',
  },
  skeleton: {
    maxWidth: 180,
    height: 27,
  },
}))

export default AccountDisplayName
