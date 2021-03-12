import React, { FC } from 'react'

import { makeStyles } from '@material-ui/core'
import { blue, deepOrange, green, yellow } from '@material-ui/core/colors'
import clsx from 'clsx'

import withComponentHocs from '../hocs/withComponentHocs'

export type AlertProps = {
  /**
   * Alert variant.
   * @default info
   */
  variant?: 'success' | 'info' | 'warning' | 'error'
}

/** Displays an alert */
const Alert: FC<AlertProps> = (props) => {
  const classes = useStyles(props)
  const { variant = 'info', children } = props

  return <div className={clsx(classes.root, classes[variant])}>{children}</div>
}

// TODO: Use semantic colors instead of material-ui colors
const useStyles = makeStyles(({ spacing, palette, shape, typography }) => ({
  root: {
    padding: spacing(1.5, 2),
    backgroundColor: palette.background.paper,
    border: 'solid 1px transparent',
    borderRadius: shape.borderRadius,
    ...typography.body2,
  },
  info: {
    background: blue[50],
    borderColor: blue[700],
  },
  success: {
    background: green[50],
    borderColor: green[700],
  },
  warning: {
    background: yellow[50],
    borderColor: yellow[700],
  },
  error: {
    background: deepOrange[50],
    borderColor: deepOrange[700],
  },
}))

export default withComponentHocs(Alert)
