/* eslint-disable react/jsx-props-no-spreading */
import { FC, useMemo } from 'react'

import { makeStyles, Skeleton } from '@material-ui/core'
import clsx from 'clsx'

import { Typography, TypographyProps } from '@kathena/ui'
import {
  ClassworkAssignment,
  useClassworkAssignmentDetailQuery,
} from 'graphql/generated'

import useClassworkAssignmentUtils from './useAssignmentUtils'

export type AssignmentDisplayNameWithId = {
  assignmentId: string
}

export type AssignmentDisplayNameWithAccount = {
  assignment: Pick<ClassworkAssignment, 'id' | 'description' | 'title'>
}

export type AssignmentDisplayNameProps = {
  maxWidth?: number
} & TypographyProps &
  (AssignmentDisplayNameWithId | AssignmentDisplayNameWithAccount)

const AssignmentDisplayName: FC<AssignmentDisplayNameProps> = (props) => {
  const { className, maxWidth, ...TypoProps } = props
  const { assignmentId } = props as AssignmentDisplayNameWithId
  const { assignment: assignmentProp } =
    props as AssignmentDisplayNameWithAccount

  const classes = useStyles(props)
  const { getTitle } = useClassworkAssignmentUtils()
  const { data, loading } = useClassworkAssignmentDetailQuery({
    variables: { id: assignmentId },
    skip: !!assignmentProp,
  })

  const assignment = useMemo(
    () => assignmentProp || data?.classworkAssignment,
    [assignmentProp, data?.classworkAssignment],
  )
  const title = useMemo(
    () => (assignment ? getTitle(assignment) : ''),
    [assignment, getTitle],
  )

  if (loading) return <Skeleton variant="text" className={classes.skeleton} />

  return (
    <Typography
      className={clsx(className, classes.root)}
      style={{ maxWidth }}
      noWrap
      title={title}
      {...TypoProps}
    >
      {title}
    </Typography>
  )
}

const useStyles = makeStyles(() => ({
  root: {
    cursor: 'default',
    maxWidth: 500,
    overflow: 'hidden',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  skeleton: {
    maxWidth: 180,
    height: 27,
  },
}))

export default AssignmentDisplayName
