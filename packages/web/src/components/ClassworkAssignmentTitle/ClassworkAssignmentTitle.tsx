/* eslint-disable react/jsx-props-no-spreading */
import { FC, useMemo } from 'react'

import { makeStyles, Skeleton } from '@material-ui/core'
import clsx from 'clsx'

import { Typography, TypographyProps } from '@kathena/ui'
import {
  ClassworkAssignment,
  useClassworkAssignmentDetailQuery,
} from 'graphql/generated'

export type ClassworkAssignmentTitleWithId = {
  classworkAssignmentId: string
}

export type ClassworkAssignmentTitleWithClassworkAssignment = {
  classworkAssignment: Pick<ClassworkAssignment, 'id' | 'title'>
}

export type ClassworkAssignmentTitleProps = TypographyProps &
  (
    | ClassworkAssignmentTitleWithId
    | ClassworkAssignmentTitleWithClassworkAssignment
  )

export const useClassworkAssignmentTitle = (classworkAssignmentId: string) => {
  const { data } = useClassworkAssignmentDetailQuery({
    variables: { id: classworkAssignmentId },
  })

  const classworkAssignment = useMemo(
    () => data?.classworkAssignment,
    [data?.classworkAssignment],
  )
  const classworkAssignmentTitle = useMemo(
    () => (classworkAssignment ? classworkAssignment.title : ''),
    [classworkAssignment],
  )

  return classworkAssignmentTitle
}

const ClassworkAssignmentName: FC<ClassworkAssignmentTitleProps> = (props) => {
  const { className, ...TypoProps } = props
  const { classworkAssignmentId } = props as ClassworkAssignmentTitleWithId
  const { classworkAssignment: classworkAssignmentProp } =
    props as ClassworkAssignmentTitleWithClassworkAssignment

  const classes = useStyles(props)
  const { data, loading } = useClassworkAssignmentDetailQuery({
    variables: { id: classworkAssignmentId },
    skip: !!classworkAssignmentProp,
  })

  const classworkAssignment = useMemo(
    () => classworkAssignmentProp || data?.classworkAssignment,
    [classworkAssignmentProp, data?.classworkAssignment],
  )
  const classworkAssignmentName = useMemo(
    () => (classworkAssignment ? classworkAssignment.title : ''),
    [classworkAssignment],
  )

  if (loading) return <Skeleton variant="text" className={classes.skeleton} />

  return (
    <Typography
      className={clsx(className, classes.root)}
      noWrap
      title={classworkAssignmentName}
      {...TypoProps}
    >
      {classworkAssignmentName}
    </Typography>
  )
}

const useStyles = makeStyles(() => ({
  root: {
    cursor: 'default',
    maxWidth: 250,
    overflow: 'hidden',
  },
  skeleton: {
    maxWidth: 180,
    height: 27,
  },
}))

export default ClassworkAssignmentName
