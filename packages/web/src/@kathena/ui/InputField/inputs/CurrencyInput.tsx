/* eslint-disable react/jsx-props-no-spreading */
import React, { FC } from 'react'

import NumberFormat from 'react-number-format'

export type CurrencyInputProps = {
  inputRef: (instance: NumberFormat | null) => void
  onChange: (event: { target: { value: string } }) => void
}

const CurrencyInput: FC<CurrencyInputProps> = (props) => {
  const { inputRef, onChange, ...other } = props

  return (
    <NumberFormat
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            value: values.value,
          },
        })
      }}
      {...other}
      thousandSeparator
      isNumericString
      allowNegative={false}
    />
  )
}

export default CurrencyInput
