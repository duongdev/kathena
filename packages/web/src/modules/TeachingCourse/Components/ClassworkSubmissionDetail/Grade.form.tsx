import { FC } from 'react'

import { ApolloError } from '@apollo/client'
import { Stack } from '@material-ui/core'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { ApolloErrorList, TextFormField } from '@kathena/ui'

export type GradeFormInput = {
  grade: number
}

export const labels: Record<keyof GradeFormInput, string> = {
  grade: 'Điểm',
}

export const validationSchema: SchemaOf<GradeFormInput> = yup.object({
  grade: yup.number().label(labels.grade).min(0).max(100).required(),
})

export const FormContent: FC<{ error?: ApolloError }> = ({ error }) => (
  <Stack spacing={2}>
    <TextFormField
      required
      type="number"
      autoFocus
      label={labels.grade}
      name="grade"
    />
    {error && <ApolloErrorList error={error} />}
  </Stack>
)
