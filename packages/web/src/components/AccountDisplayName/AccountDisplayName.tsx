/* eslint-disable react/jsx-props-no-spreading */
import { FC, useMemo } from 'react'

import { makeStyles, Skeleton } from '@material-ui/core'
import clsx from 'clsx'

import { Typography, TypographyProps } from '@kathena/ui'
import { useAccountDisplayNameQuery } from 'graphql/generated'
import useAccountUtils from 'utils/useAccountUtils'

export type AccountDisplayNameProps = {
  accountId: string
} & TypographyProps

const AccountDisplayName: FC<AccountDisplayNameProps> = (props) => {
  const { accountId, className, ...TypoProps } = props
  const classes = useStyles(props)
  const { getDisplayName } = useAccountUtils()
  const { data, loading } = useAccountDisplayNameQuery({
    variables: { id: accountId },
  })

  const account = useMemo(() => data?.account, [data?.account])
  const displayName = useMemo(() => (account ? getDisplayName(account) : ''), [
    account,
    getDisplayName,
  ])

  if (loading) return <Skeleton variant="text" className={classes.skeleton} />

  return (
    <Typography className={clsx(className, classes.root)} {...TypoProps}>
      {displayName}
    </Typography>
  )
}

const useStyles = makeStyles(() => ({
  root: {
    fontWeight: 'bold',
    cursor: 'default',
  },
  skeleton: {
    maxWidth: 180,
    height: 27,
  },
}))

export default AccountDisplayName
