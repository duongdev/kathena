/* eslint-disable react/jsx-props-no-spreading */
import { useMemo } from 'react'

import { useDetailClassworkMaterialQuery } from 'graphql/generated'

const useClassworkMaterialName = (classworkId: string) => {
  const { data } = useDetailClassworkMaterialQuery({
    variables: {
      Id: classworkId,
    },
  })

  const classwork = useMemo(
    () => data?.classworkMaterial,
    [data?.classworkMaterial],
  )
  const title = useMemo(() => classwork?.title ?? '', [classwork])

  return title
}

export default useClassworkMaterialName
