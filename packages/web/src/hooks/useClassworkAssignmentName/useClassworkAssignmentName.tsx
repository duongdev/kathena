/* eslint-disable react/jsx-props-no-spreading */
import { useMemo } from 'react'

import { useClassworkAssignmentDetailQuery } from 'graphql/generated'

const useClassworkAssignmentName = (classworkId: string) => {
  const { data } = useClassworkAssignmentDetailQuery({
    variables: {
      id: classworkId,
    },
  })

  const classwork = useMemo(
    () => data?.classworkAssignment,
    [data?.classworkAssignment],
  )
  const title = useMemo(() => classwork?.title ?? '', [classwork])

  return title
}

export default useClassworkAssignmentName
