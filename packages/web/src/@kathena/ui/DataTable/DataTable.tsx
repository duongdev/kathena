/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import React, { ReactNode, useCallback } from 'react'

import {
  Fade,
  makeStyles,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableCellProps,
  TableContainer,
  TableHead,
  TablePagination,
  TablePaginationProps,
  TableRow,
  TableSortLabel,
  Theme,
} from '@material-ui/core'

import { repeatArray } from '@kathena/utils'

import Spinner from '../Spinner'

type Column<RowData> = {
  label?: string
  field?: keyof RowData
  render?: (row: RowData, index: number) => ReactNode
  align?: TableCellProps['align']
  padding?: TableCellProps['padding']
  width?: number | string
  skeleton?: ReactNode
}

export type DataTableProps<RowData extends object> = {
  data: RowData[]
  order?: 'desc' | 'asc'
  orderBy?: keyof RowData
  sortableColumns?: Array<keyof RowData>
  onRequestSort?: (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    property?: keyof RowData,
  ) => void
  rowKey: string | number | ((row: RowData) => string | number)
  maxHeight?: number
  columns: Column<RowData>[]
  loading?: boolean
  pagination?: TablePaginationProps
  skeletonCount?: number
  classes?: Partial<
    Record<'root' | 'tableHead' | 'spinner' | 'rowItem', string>
  >
}

const getCellValue = <RowData extends object>(
  row: RowData,
  column: Column<RowData>,
  index: number,
) => {
  if (typeof column.render === 'function') {
    return column.render(row, index)
  }

  if (column.field) {
    return (row as any)[column.field]
  }

  return null
}

const getRowKey = <RowData extends object>(
  row: RowData,
  rowKey: DataTableProps<RowData>['rowKey'],
) => {
  if (typeof rowKey === 'function') {
    return rowKey(row)
  }
  return (row as any)[rowKey]
}

const DataTable = <RowData extends object>(props: DataTableProps<RowData>) => {
  const classes = useStyles(props)

  const handleSort = useCallback(
    (property?: keyof RowData) =>
      (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        if (typeof props.onRequestSort === 'function') {
          props.onRequestSort(event, property)
        }
      },
    [props],
  )

  return (
    <Fade in>
      <div>
        <TableContainer className={classes.root}>
          {props.loading && (
            <Spinner
              container="overlay"
              delay={1000}
              className={classes.spinner}
            />
          )}
          <Table>
            <TableHead classes={{ root: classes.tableHead }}>
              <TableRow>
                {props.columns.map((column, idx) => {
                  if (
                    column.field &&
                    props.sortableColumns?.includes(column.field)
                  ) {
                    const sortLabelActivated =
                      props.orderBy && props.orderBy === column.field

                    return (
                      <TableCell
                        align={column.align}
                        padding={column.padding}
                        key={`${column.label}-${idx}`}
                        style={{ width: column.width }}
                      >
                        <TableSortLabel
                          active={sortLabelActivated}
                          direction={
                            props.orderBy === column.field
                              ? props.order
                              : undefined
                          }
                          onClick={handleSort(column.field)}
                        >
                          {column.label}
                        </TableSortLabel>
                      </TableCell>
                    )
                  }

                  return (
                    <TableCell
                      align={column.align}
                      padding={column.padding}
                      key={`${column.label}-${idx}`}
                      style={{ width: column.width }}
                    >
                      {column.label}
                    </TableCell>
                  )
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {props.loading && props.data.length === 0
                ? repeatArray(props.skeletonCount ?? 5).map((idx) => (
                    <TableRow className={classes.rowItem} key={idx}>
                      {props.columns.map(
                        ({ skeleton = <Skeleton />, ...column }, idx) => (
                          <TableCell
                            align={column.align}
                            padding={column.padding}
                            key={`${column.label}-${column.field || idx}`}
                            style={{ width: column.width }}
                          >
                            {skeleton}
                          </TableCell>
                        ),
                      )}
                    </TableRow>
                  ))
                : props.data.map((row, idx) => (
                    <TableRow
                      key={getRowKey(row, props.rowKey) || idx}
                      className={classes.rowItem}
                    >
                      {props.columns.map((column, idc) => (
                        <TableCell
                          align={column.align}
                          padding={column.padding}
                          key={`${column.label}-${column.field || idc}`}
                          style={{ width: column.width }}
                        >
                          {getCellValue(row, column, idx)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
        {props.pagination && (
          <TablePagination
            {...{
              component: 'div',
              ...props.pagination,
            }}
          />
        )}
      </div>
    </Fade>
  )
}

const useStyles = makeStyles<Theme, DataTableProps<any>>(({ shape }) => ({
  root: ({ maxHeight }) => ({
    position: 'relative',
    overflow: 'auto',
    // margin: spacing(0, -2),
    // padding: spacing(0, 2),
    maxHeight: maxHeight ?? 'unset',
    width: '100%',
    // width: `calc(100% + ${spacing(4)}px)`,
  }),
  tableHead: {},
  rowItem: {
    // transition: transitions.create('box-shadow', { duration: 300 }),
    // '&:hover': {
    //   boxShadow: shadows[2],
    // },
  },
  spinner: {
    borderRadius: shape.borderRadius,
  },
}))

export default DataTable
