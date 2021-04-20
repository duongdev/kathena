/* eslint-disable react/jsx-props-no-spreading */
import React, { FC, useMemo } from 'react'

import { GridProps } from '@material-ui/core'
import { FastField, Field, FieldProps } from 'formik'

import AccountAssigner, { AccountAssignerProps } from './AccountAssigner'

export type AccountAssignerFormFieldProps = {
  name: string
  autoFocus?: boolean
  type?: string
  required?: boolean
  fastField?: boolean
} & AccountAssignerProps & {
    gridItem?: boolean | GridProps
    gridProps?: GridProps
  }

const AccountAssignerFormField: FC<AccountAssignerFormFieldProps> = (props) =>
  useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { children, fastField, disabled, ...inputProps } = props
    const FieldComponent = fastField ? FastField : Field

    return (
      <FieldComponent name={props.name}>
        {({ field, meta, form }: FieldProps) => {
          const error = form.submitCount > 0 && meta.touched && meta.error
          return (
            <AccountAssigner
              required={props.required}
              color={error ? 'error' : 'default'}
              fullWidth
              {...inputProps}
              {...field}
              onChange={(e, value) => form.setFieldValue(field.name, value)}
              disabled={disabled ?? form.isSubmitting}
            />
          )
        }}
      </FieldComponent>
    )
  }, [props])

AccountAssignerFormField.defaultProps = {
  fastField: true,
}

export default AccountAssignerFormField
