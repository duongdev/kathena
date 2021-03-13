/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { FC, ReactNode, useMemo } from 'react'

import { useField, useFormikContext } from 'formik'
import { get } from 'lodash'

import { GridItemContainerProps } from '../GridItemContainer'
import Select, { SelectProps } from '../Select'

export type SelectFormFieldProps = {
  name: string
  overrideErrorMessage?: ReactNode
} & Omit<SelectProps, 'value'> &
  GridItemContainerProps

const SelectFormField: FC<SelectFormFieldProps> = ({
  name,
  overrideErrorMessage,
  ...props
}) => {
  const [{ value, ...field }] = useField(name)
  const { isSubmitting, errors, touched, submitCount } = useFormikContext()

  const error = useMemo(() => {
    const error = (!!submitCount || get(touched, name)) && get(errors, name)

    if (error) {
      return overrideErrorMessage ?? error
    }
    return error
  }, [errors, name, overrideErrorMessage, submitCount, touched])

  return (
    <Select
      value={value || ''}
      {...field}
      {...props}
      error={!!error}
      helperText={error ?? props.helperText}
      disabled={props.disabled ?? isSubmitting}
    />
  )
}

export default SelectFormField
