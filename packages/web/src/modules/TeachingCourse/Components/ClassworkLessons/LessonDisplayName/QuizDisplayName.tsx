/* eslint-disable react/jsx-props-no-spreading */
import { FC, useMemo } from 'react'

import { makeStyles, Skeleton } from '@material-ui/core'
import clsx from 'clsx'

import { Typography, TypographyProps } from '@kathena/ui'
import { ClassworkAssignment, useQuizQuery } from 'graphql/generated'

import useClassworkAssignmentUtils from './useAssignmentUtils'

export type QuizDisplayNameWithId = {
  quizId: string
}

export type QuizDisplayNameWithAccount = {
  quiz: Pick<ClassworkAssignment, 'id' | 'description' | 'title'>
}

export type QuizDisplayNameProps = {
  maxWidth?: number
} & TypographyProps &
  (QuizDisplayNameWithId | QuizDisplayNameWithAccount)

const QuizDisplayName: FC<QuizDisplayNameProps> = (props) => {
  const { className, maxWidth, ...TypoProps } = props
  const { quizId } = props as QuizDisplayNameWithId
  const { quiz: quizProp } = props as QuizDisplayNameWithAccount

  const classes = useStyles(props)
  const { getTitle } = useClassworkAssignmentUtils()
  const { data, loading } = useQuizQuery({
    variables: { id: quizId },
    skip: !!quizProp,
  })

  const quiz = useMemo(() => quizProp || data?.quiz, [quizProp, data?.quiz])
  const title = useMemo(() => (quiz ? getTitle(quiz) : ''), [quiz, getTitle])

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

export default QuizDisplayName
