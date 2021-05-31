/* eslint-disable react/jsx-props-no-spreading */
import { FC, useMemo } from 'react'

import { makeStyles, Skeleton } from '@material-ui/core'
import clsx from 'clsx'

import { Typography, TypographyProps } from '@kathena/ui'
import { Course, useCourseDetailQuery } from 'graphql/generated'

export type CourseNameWithId = {
  courseId: string
}

export type CourseNameWithCourse = {
  course: Pick<Course, 'id' | 'name'>
}

export type CourseNameProps = TypographyProps &
  (CourseNameWithId | CourseNameWithCourse)

const CourseName: FC<CourseNameProps> = (props) => {
  const { className, ...TypoProps } = props
  const { courseId } = props as CourseNameWithId
  const { course: courseProp } = props as CourseNameWithCourse

  const classes = useStyles(props)
  const { data, loading } = useCourseDetailQuery({
    variables: { id: courseId },
    skip: !!courseProp,
  })

  const course = useMemo(
    () => courseProp || data?.findCourseById,
    [courseProp, data?.findCourseById],
  )
  const courseName = useMemo(() => (course ? course.name : ''), [course])

  if (loading) return <Skeleton variant="text" className={classes.skeleton} />

  return (
    <Typography
      className={clsx(className, classes.root)}
      noWrap
      title={courseName}
      {...TypoProps}
    >
      {courseName}
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

export default CourseName
