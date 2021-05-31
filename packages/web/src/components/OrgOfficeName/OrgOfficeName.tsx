/* eslint-disable react/jsx-props-no-spreading */
import { FC, useMemo } from 'react'

import { makeStyles, Skeleton } from '@material-ui/core'
import clsx from 'clsx'

import { Typography, TypographyProps } from '@kathena/ui'
import { OrgOffice, useOrgOfficeQuery } from 'graphql/generated'

export type OrgOfficeNameWithId = {
  orgOfficeId: string
}

export type OrgOfficeNameWithOrgOffice = {
  orgOffice: Pick<OrgOffice, 'id' | 'name'>
}

export type OrgOfficeNameProps = TypographyProps &
  (OrgOfficeNameWithId | OrgOfficeNameWithOrgOffice)

const OrgOfficeName: FC<OrgOfficeNameProps> = (props) => {
  const { className, ...TypoProps } = props
  const { orgOfficeId } = props as OrgOfficeNameWithId
  const { orgOffice: orgOfficeProp } = props as OrgOfficeNameWithOrgOffice

  const classes = useStyles(props)
  const { data, loading } = useOrgOfficeQuery({
    variables: { id: orgOfficeId },
    skip: !!orgOfficeProp,
  })

  const orgOffice = useMemo(
    () => orgOfficeProp || data?.orgOffice,
    [orgOfficeProp, data?.orgOffice],
  )
  const orgOfficeName = useMemo(
    () => (orgOffice ? orgOffice.name : ''),
    [orgOffice],
  )

  if (loading) return <Skeleton variant="text" className={classes.skeleton} />

  return (
    <Typography
      className={clsx(className, classes.root)}
      noWrap
      title={orgOfficeName}
      {...TypoProps}
    >
      {orgOfficeName}
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

export default OrgOfficeName
