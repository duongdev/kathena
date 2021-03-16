import { FC, useMemo } from 'react'

import { Skeleton } from '@material-ui/core'

import withComponentHocs from '../hocs/withComponentHocs'

export type ContentSkeletonProps = {
  /**
   * Number of skeleton rows to be rendered.
   * @defaults 3
   */
  rows?: number

  rowsWidth?: number[]
}

export const ContentSkeleton: FC<ContentSkeletonProps> = (props) => {
  const skeletons = useMemo(() => {
    const max = 80
    const min = 20
    const rowsCount = Math.max(props.rows ?? 0, props.rowsWidth?.length ?? 0)

    const rows = Array.from('.'.repeat(rowsCount)).map((row, idx) => (
      <Skeleton
        // eslint-disable-next-line react/no-array-index-key
        key={idx}
        width={`${
          props.rowsWidth?.[idx] ?? Math.random() * (max - min) + min
        }%`}
      />
    ))
    return rows
    // eslint-disable-next-line react/destructuring-assignment
  }, [props.rows, props.rowsWidth])

  return <div>{skeletons}</div>
}

ContentSkeleton.defaultProps = {
  rows: 3,
}

export default withComponentHocs(ContentSkeleton)
