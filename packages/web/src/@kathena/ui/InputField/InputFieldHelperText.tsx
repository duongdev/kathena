/* eslint-disable react/destructuring-assignment */
import React, { FC } from 'react'

import { makeStyles } from '@material-ui/core'
import clsx from 'clsx'

import Typography from '../Typography'

import { InputFieldProps } from './InputField'

export type InputFieldHelperTextProps = {
  color?: InputFieldProps['color']
}

const InputFieldHelperText: FC<InputFieldHelperTextProps> = (props) => {
  const classes = useStyles(props)

  return (
    <Typography
      color="textSecondary"
      variant="caption"
      className={clsx(classes.root, {
        error: props.color === 'error',
        success: props.color === 'success',
      })}
    >
      {props.children}
    </Typography>
  )
}

InputFieldHelperText.defaultProps = {
  color: 'default',
}

const useStyles = makeStyles(({ spacing, palette }) => ({
  root: {
    marginTop: spacing(0.5),
    '&.error': {
      color: palette.error.main,
    },
    '&.success': {
      color: palette.semantic.green,
    },
  },
}))

export default InputFieldHelperText
