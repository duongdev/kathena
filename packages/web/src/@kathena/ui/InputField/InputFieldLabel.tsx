/* eslint-disable react/destructuring-assignment */
import React, { FC } from 'react'

import { makeStyles } from '@material-ui/core'
import clsx from 'clsx'

import Typography from '../Typography'

import { InputFieldProps } from './InputField'

export type InputFieldLabelProps = {
  focused?: boolean
  color?: InputFieldProps['color']
  required?: boolean
}

const InputFieldLabel: FC<InputFieldLabelProps> = (props) => {
  const classes = useStyles(props)
  const { focused, color, required } = props

  return (
    <Typography
      variant="body2"
      color="textSecondary"
      classes={{
        root: clsx(classes.label, {
          focus: focused,
          error: color === 'error',
          success: color === 'success',
        }),
      }}
    >
      {props.children}
      {required && ' *'}
    </Typography>
  )
}

const useStyles = makeStyles(
  ({ spacing, typography, palette, transitions }) => ({
    label: {
      marginBottom: spacing(0.5),
      fontFamily: typography.h1.fontFamily,

      transition: transitions.create('color', {
        duration: transitions.duration.short,
        easing: transitions.easing.easeInOut,
      }),
      '&.focus': {
        color: palette.primary.main,
      },
      '&.error': {
        color: palette.error.main,
      },
      '&.success': {
        color: palette.semantic.green,
      },
    },
  }),
)

export default InputFieldLabel
