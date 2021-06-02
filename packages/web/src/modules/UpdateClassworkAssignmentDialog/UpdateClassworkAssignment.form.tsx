import { FC } from 'react'

import { ApolloError } from '@apollo/client'
import { Stack } from '@material-ui/core'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { ApolloErrorList, EditorFormField, TextFormField } from '@kathena/ui'

export type UpdateClassworkAssignmentFormInput = {
  title: string
  description: string
  dueDate: string
}

export const labels: Record<keyof UpdateClassworkAssignmentFormInput, string> =
  {
    title: 'Tiêu đề',
    description: 'Mô tả',
    dueDate: 'Ngày hết hạn',
  }

export const validationSchema: SchemaOf<UpdateClassworkAssignmentFormInput> =
  yup.object({
    title: yup.string().label(labels.title).trim().required(),
    description: yup.string().label(labels.description).required(),
    dueDate: yup.string().label(labels.dueDate).trim().required(),
  })

export const FormContent: FC<{ error?: ApolloError }> = ({ error }) => (
  <Stack spacing={2}>
    <TextFormField required autoFocus label={labels.title} name="title" />
    <EditorFormField required name="description" label={labels.description} />
    <TextFormField required type="date" label={labels.dueDate} name="dueDate" />
    {error && <ApolloErrorList error={error} />}
  </Stack>
)
