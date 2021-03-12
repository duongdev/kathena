/* eslint-disable react/jsx-props-no-spreading */
import React, { FC, useMemo } from 'react'

import { GridProps } from '@material-ui/core'
import { FastField, Field, FieldProps } from 'formik'

import InputField, { InputFieldProps } from '../InputField'
// import CurrencyFormField from './CurrencyFormField'

export type TextFormFieldProps = {
  name: string
  autoFocus?: boolean
  type?: string
  required?: boolean
  fastField?: boolean
} & Omit<InputFieldProps, 'variant'> & {
    gridItem?: boolean | GridProps
    gridProps?: GridProps
  }

const TextFormField: FC<TextFormFieldProps> = (props) => {
  return useMemo(() => {
    // if (props.variant === 'currency') {
    //   return <CurrencyFormField {...props} />
    // }

    const { children, fastField, disabled, ...inputProps } = props
    const FieldComponent = fastField ? FastField : Field

    return (
      <FieldComponent name={props.name}>
        {({ field, meta, form }: FieldProps) => {
          const error = form.submitCount > 0 && meta.touched && meta.error
          const helperText = error || props.helperText

          return (
            <InputField
              required={props.required}
              color={error ? 'error' : 'default'}
              fullWidth
              {...inputProps}
              {...field}
              disabled={disabled ?? form.isSubmitting}
              helperText={helperText}
            />
          )
        }}
      </FieldComponent>
    )
  }, [props])
}

TextFormField.defaultProps = {
  fastField: true,
}

export default TextFormField
