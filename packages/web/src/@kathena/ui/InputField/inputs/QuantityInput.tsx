/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable @typescript-eslint/naming-convention */
import React, { FC, useCallback, useEffect, useState } from 'react'

import {
  Grid,
  IconButton,
  Input,
  InputProps,
  makeStyles,
} from '@material-ui/core'
import { MinusCircle, PlusCircle } from 'phosphor-react'

export type QuantityInputProps = {
  quantity?: number
  onQuantityChange?: (quantity: number) => void
  min?: number
  max?: number
} & InputProps

const QuantityInput: FC<QuantityInputProps> = ($props) => {
  const classes = useStyles($props)
  const [value, _setValue] = useState($props.quantity || 0)

  const { onQuantityChange, ...props } = $props

  const setValue = useCallback(
    (nextValue: number) => {
      if (typeof props.min === 'number' && nextValue < props.min) {
        return _setValue(props.min)
      }
      if (typeof props.max === 'number' && nextValue > props.max) {
        return _setValue(props.max)
      }
      return _setValue(nextValue)
    },
    [props.min, props.max],
  )

  useEffect(() => {
    if (typeof props.quantity === 'number' && props.quantity !== value) {
      setValue(props.quantity)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.quantity])

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(+(event.target.value || 0))
    },
    [setValue],
  )

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(value)
      onQuantityChange?.(value)
      return props.onBlur?.(event)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setValue, value, onQuantityChange, props.onBlur],
  )

  const handleButtonClick = useCallback(
    (delta: number) => (
      event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ) => {
      event.preventDefault()
      const nextValue = value + delta

      setValue(nextValue)
      onQuantityChange?.(nextValue)
    },
    [onQuantityChange, setValue, value],
  )

  return (
    <Grid container spacing={1} alignItems="center">
      <Grid item>
        <IconButton
          color="primary"
          size="small"
          onMouseDown={handleButtonClick(-1)}
          disabled={typeof props.min === 'number' && value <= props.min}
        >
          <MinusCircle />
        </IconButton>
      </Grid>
      <Grid item>
        <Input
          type="number"
          {...props}
          classes={{ root: classes.root, input: classes.input }}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </Grid>
      <Grid item>
        <IconButton
          color="primary"
          size="small"
          onMouseDown={handleButtonClick(1)}
          disabled={typeof props.max === 'number' && value >= props.max}
        >
          <PlusCircle />
        </IconButton>
      </Grid>
    </Grid>
  )
}

QuantityInput.defaultProps = {
  min: 0,
}

const useStyles = makeStyles(({ spacing }) => ({
  root: { padding: `0 !important` },
  input: {
    textAlign: 'center',
    width: 50,
    padding: spacing(0.5, 1),

    // To hide the number input arrows
    '&::-webkit-outer-spin-button,&::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
    '&[type=number]': {
      '-moz-appearance': 'textfield',
    },
  },
}))

export default QuantityInput
