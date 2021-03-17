import { useCallback } from 'react'

import qs from 'query-string'
import { useHistory, useLocation } from 'react-router-dom'

import { ANY } from '@kathena/types'
import { wait } from '@kathena/utils'

// tslint:disable-next-line: typedef
function useLocationQuery() {
  const { search } = useLocation()
  const history = useHistory()
  const query = qs.parse(search)

  const makeQuery = (q: ANY, options?: { stringify: boolean }) => {
    const nextQuery = {
      ...query,
      ...q,
    }

    return options?.stringify ? qs.stringify(nextQuery) : nextQuery
  }

  /** Update URL search (one of field) */
  const updateQuery = useCallback(
    async (update: { [k: string]: string | number }) => {
      const nextQuery = {
        ...query,
        ...update,
      }

      // to improve performance
      await wait(50)

      return history.push({
        pathname: history.location.pathname,
        search: qs.stringify(nextQuery),
      })
    },
    [history, query],
  )

  return {
    query,
    makeQuery,
    updateQuery,
  }
}

export default useLocationQuery
