/* eslint-disable react/jsx-props-no-spreading */
import { useMemo } from 'react'

import { useCourseDetailQuery } from 'graphql/generated'

const useCourseName = (courseId: string) => {
  const { data } = useCourseDetailQuery({
    variables: {
      id: courseId,
    },
  })

  const course = useMemo(() => data?.findCourseById, [data?.findCourseById])
  const courseName = useMemo(() => course?.name ?? '', [course])

  return courseName
}

export default useCourseName
