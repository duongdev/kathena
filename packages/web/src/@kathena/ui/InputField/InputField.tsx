/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */
import React, { FC, ReactNode, useCallback, useMemo, useState } from 'react'

import {
  FormControl,
  Input,
  InputAdornment,
  InputProps,
  makeStyles,
  Theme,
} from '@material-ui/core'
import clsx from 'clsx'

import { ANY } from '@kathena/types'

import { withGridItem } from '../GridItemContainer'

import InputFieldHelperText from './InputFieldHelperText'
import InputFieldLabel from './InputFieldLabel'
import CurrencyInput from './inputs/CurrencyInput'
import QuantityInput from './inputs/QuantityInput'

export type InputFieldProps = Omit<InputProps, 'color'> & {
  startAdornment?: ReactNode
  endAdornment?: ReactNode
  /**
   * @default default
   */
  color?: 'default' | 'error' | 'success'
  label?: ReactNode
  helperText?: ReactNode
  required?: boolean
} & (
    | {
        variant?: 'text'
      }
    | { variant: 'currency' }
    | {
        variant: 'quantity'
        min?: number
        max?: number
        onQuantityChange?: (value: number) => void
        quantity?: number
      }
  )

const InputField: FC<InputFieldProps> = (props) => {
  const classes = useStyles(props)
  const [isFocused, setFocus] = useState(false)
  const {
    color: colorProp,
    error,
    endAdornment,
    fullWidth,
    helperText,
    label,
    onBlur,
    onFocus,
    startAdornment,
    className,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    required,
    ...rest
  } = props

  const color = error ? 'error' : colorProp

  const handleFocus = useCallback(
    (event) => {
      setFocus(true)
      if (onFocus) {
        onFocus(event)
      }
    },
    [onFocus],
  )
  const handleBlur = useCallback(
    (event) => {
      setFocus(false)
      if (onBlur) {
        onBlur(event)
      }
    },
    [onBlur],
  )

  const inputVariantProps = useMemo(() => {
    const inputProps: InputProps = {}
    if (props.variant === 'currency') {
      inputProps.inputComponent = (props: ANY) =>
        (<CurrencyInput name={rest.name} {...props} />) as ANY
    }

    return inputProps
  }, [props.variant, rest.name])

  const inputElement =
    props.variant === 'quantity' ? (
      <QuantityInput
        onFocus={handleFocus}
        onBlur={handleBlur}
        min={props.min}
        max={props.max}
        onQuantityChange={props.onQuantityChange}
        {...rest}
        {...inputVariantProps}
        className={clsx(classes.input, {
          disabled: rest.disabled,
          focus: isFocused && !rest.disabled,
          error: color === 'error',
          success: color === 'success',
        })}
      />
    ) : (
      <Input
        ref={props.ref}
        onFocus={handleFocus}
        onBlur={handleBlur}
        startAdornment={
          startAdornment && (
            <InputAdornment position="start" className={classes.startAdornment}>
              {startAdornment}
            </InputAdornment>
          )
        }
        endAdornment={
          endAdornment && (
            <InputAdornment position="end">{endAdornment}</InputAdornment>
          )
        }
        {...rest}
        {...inputVariantProps}
        className={clsx(classes.input, {
          disabled: rest.disabled,
          focus: isFocused && !rest.disabled,
          error: color === 'error',
          success: color === 'success',
        })}
      />
    )

  return (
    <FormControl
      // innerRef={props.ref}
      fullWidth={fullWidth}
      className={clsx(classes.root, className)}
    >
      {label && (
        <InputFieldLabel
          focused={isFocused && !rest.disabled}
          color={color}
          required={props.required}
        >
          {label}
        </InputFieldLabel>
      )}
      {inputElement}
      {helperText && (
        <InputFieldHelperText color={color}>{helperText}</InputFieldHelperText>
      )}
    </FormControl>
  )
}

InputField.defaultProps = {
  color: 'default',
  disableUnderline: true,
  variant: 'text',
}

const useStyles = makeStyles<Theme, InputFieldProps>(
  ({ spacing, palette, shape, transitions, shadows }) => ({
    root: (props) => ({
      display: props.fullWidth ? 'flex' : 'inline-flex',
      flexDirection: 'column',
    }),
    input: {
      transition: transitions.create(
        ['color', 'border-color', 'background-color', 'box-shadow'],
        {
          duration: transitions.duration.short,
          easing: transitions.easing.easeInOut,
        },
      ),
      backgroundColor: palette.background.dark,
      padding: spacing(0.5, 1),
      borderRadius: shape.borderRadius,
      border: `2px solid ${palette.background.dark}`,
      '& > input': {
        paddingLeft: spacing(1),
        paddingRight: spacing(1),
      },
      '& > textarea': {
        padding: spacing(1),
      },
      '&.error': {
        borderColor: palette.error.main,
      },
      '&.success': {
        borderColor: palette.semantic.green,
      },
      '&.focus': {
        borderColor: palette.primary.main,
        color: palette.text.primary,
        boxShadow: shadows[1],
      },
      '&.disabled': {
        borderColor: palette.action.disabledBackground,
        backgroundColor: palette.action.disabledBackground,
      },
    },
    startAdornment: {
      marginRight: 0,
    },
  }),
)

export default withGridItem(InputField)
