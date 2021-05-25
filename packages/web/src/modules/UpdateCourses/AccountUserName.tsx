/* eslint-disable react/jsx-props-no-spreading */
import { FC, useMemo } from 'react'

import { makeStyles, Skeleton } from '@material-ui/core'
import clsx from 'clsx'

import { Typography, TypographyProps } from '@kathena/ui'
import { Account, useAccountDisplayNameQuery } from 'graphql/generated'
import useAccountUtils from 'utils/useAccountUtils'

export type AccountUserNameWithId = {
  accountId: string
}

export type AccountUserNameWithAccount = {
  account: Pick<Account, 'id' | 'username' | 'displayName'>
}

export type AccountUserNameProps = TypographyProps &
  (AccountUserNameWithId | AccountUserNameWithAccount)

const AccountUserName: FC<AccountUserNameProps> = (props) => {
  const { className, ...TypoProps } = props
  const { accountId } = props as AccountUserNameWithId
  const { account: accountProp } = props as AccountUserNameWithAccount

  const classes = useStyles(props)
  const { getUserName } = useAccountUtils()
  const { data, loading } = useAccountDisplayNameQuery({
    variables: { id: accountId },
    skip: !!accountProp,
  })

  const account = useMemo(
    () => accountProp || data?.account,
    [accountProp, data?.account],
  )
  const username = useMemo(
    () => (account ? getUserName(account) : ''),
    [account, getUserName],
  )

  if (loading) return <Skeleton variant="text" className={classes.skeleton} />

  return (
    <Typography
      className={clsx(className, classes.root)}
      title={username}
      {...TypoProps}
    >
      @{username}
    </Typography>
  )
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

export default AccountUserName
