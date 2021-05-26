/* eslint-disable react/jsx-props-no-spreading */
import React, { FC, useMemo } from 'react'

import { FormControl, GridProps } from '@material-ui/core'
import { FastField, Field, FieldProps } from 'formik'
import ReactQuill from 'react-quill'

import { ANY } from '@kathena/types'

import InputFieldHelperText from '../InputField/InputFieldHelperText'
import InputFieldLabel from '../InputField/InputFieldLabel'
import 'react-quill/dist/quill.snow.css'

export type EditorFormFieldProps = {
  name: string
  required?: boolean
  fastField?: boolean
  fullWidth?: boolean
  label?: string
  disabled?: boolean
} & {
  gridItem?: boolean | GridProps
  gridProps?: GridProps
}

const EditorFormField: FC<EditorFormFieldProps> = (props) =>
  useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { children, label, fullWidth, fastField, ...inputProps } = props
    const FieldComponent = fastField ? FastField : Field

    return (
      <FieldComponent name={props.name}>
        {({ field, meta, form }: FieldProps) => {
          const error = form.submitCount > 0 && meta.touched && meta.error

          return (
            <FormControl fullWidth={fullWidth}>
              {label && (
                <InputFieldLabel
                  color={error ? 'error' : 'default'}
                  required={props.required}
                >
                  {label}
                </InputFieldLabel>
              )}
              <ReactQuill
                theme="snow"
                modules={{
                  toolbar: [
                    [{ header: '1' }, { header: '2' }, { font: [] }],
                    [{ size: [] }],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [
                      { list: 'ordered' },
                      { list: 'bullet' },
                      { indent: '-1' },
                      { indent: '+1' },
                    ],
                    ['link', 'image', 'video'],
                    ['clean'],
                  ],
                  clipboard: {
                    // toggle to add extra line breaks when pasting HTML:
                    matchVisual: false,
                  },
                }}
                formats={[
                  'header',
                  'font',
                  'size',
                  'bold',
                  'italic',
                  'underline',
                  'strike',
                  'blockquote',
                  'list',
                  'bullet',
                  'indent',
                  'link',
                  'image',
                  'video',
                ]}
                {...inputProps}
                onChange={(value: ANY) => form.setFieldValue(props.name, value)}
                readOnly={props.disabled ?? form.isSubmitting}
                value={field.value}
              />
              {error && (
                <InputFieldHelperText color="error">
                  {error}
                </InputFieldHelperText>
              )}
            </FormControl>
          )
        }}
      </FieldComponent>
    )
  }, [props])

EditorFormField.defaultProps = {
  fastField: true,
}

export default EditorFormField
