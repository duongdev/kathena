import { useCallback, useEffect, useRef, useState } from 'react'

import { useLocationQuery } from './useLocationQuery'

export type PaginationState = {
  page: number
  perPage: number
}

export const usePagination = (initialValues?: Partial<PaginationState>) => {
  const {
    query: { page: qPage, perPage: qPerPage },
    updateQuery,
  } = useLocationQuery()
  const [{ page, perPage }, $setPagination] = useState<PaginationState>({
    page: initialValues?.page ?? +(qPage ?? '0'),
    perPage: initialValues?.perPage ?? +(qPerPage ?? '10'),
  })
  const dirtyRef = useRef(false)

  const setPagination = useCallback((pagination: PaginationState) => {
    dirtyRef.current = true
    $setPagination(pagination)
  }, [])

  const setPage = useCallback(
    (nextPage: number) =>
      setPagination({
        page: nextPage,
        perPage,
      }),
    [perPage, setPagination],
  )

  const setPerPage = useCallback(
    (nextPerPage: number) =>
      setPagination({
        perPage: nextPerPage,
        page: 0,
      }),
    [setPagination],
  )

  useEffect(() => {
    if (!dirtyRef.current) return

    updateQuery({ page, perPage })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage])

  // useEffect(() => {
  //   setPagination({
  //     perPage: +(qPerPage ?? '10'),
  //     page: +(page ?? '0'),
  //   })
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [qPage, qPerPage, setPagination])

  return {
    page: +((qPage ?? '0') as string),
    perPage: +((qPerPage ?? '10') as string),
    setPage,
    setPerPage,
  }
}
