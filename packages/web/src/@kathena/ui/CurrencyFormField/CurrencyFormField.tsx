/* eslint-disable react/jsx-props-no-spreading */
import React, { FC, useMemo } from 'react'

import { GridProps } from '@material-ui/core'
import { FastField, Field, FieldProps } from 'formik'

import { InputField, InputFieldProps } from '@kathena/ui'

export type CurrencyFormFieldProps = {
  name: string
  autoFocus?: boolean
  fastField?: boolean
  required?: boolean
} & InputFieldProps & { gridItem?: boolean | GridProps; gridProps?: GridProps }

const CurrencyFormField: FC<CurrencyFormFieldProps> = (props) => {
  const { fastField, name, helperText: $helperText, disabled, ...rest } = props
  const FieldComponent = useMemo(() => (fastField ? FastField : Field), [
    fastField,
  ])

  return (
    <FieldComponent name={name}>
      {({ form, meta }: FieldProps) => {
        const error = form.submitCount > 0 && meta.touched && meta.error
        const helperText = error || $helperText

        return (
          <InputField
            required={props.required}
            fullWidth
            color={error ? 'error' : 'default'}
            variant="currency"
            // eslint-disable-next-line
            onChange={(event: any) =>
              form.setFieldValue(name, +event.target.value)
            }
            {...rest}
            value={meta.value}
            disabled={disabled ?? form.isSubmitting}
            helperText={helperText}
          />
        )
      }}
    </FieldComponent>
  )
}

CurrencyFormField.defaultProps = {
  fastField: true,
}

export default CurrencyFormField
