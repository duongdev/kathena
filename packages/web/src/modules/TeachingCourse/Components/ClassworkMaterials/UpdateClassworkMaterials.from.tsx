import { FC } from 'react'

import { ApolloError } from '@apollo/client'
import { makeStyles, Stack } from '@material-ui/core'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { EditorFormField, TextFormField, ApolloErrorList } from '@kathena/ui'

export type ClassworkMaterialWithId = {}
export type UpdateClassworkMaterialsFormInput = {
  title: string
  description: string
}

export const labels: Record<keyof UpdateClassworkMaterialsFormInput, string> = {
  title: 'Tiêu đề',
  description: 'Mô tả',
}

export const validationSchema: SchemaOf<UpdateClassworkMaterialsFormInput> =
  yup.object({
    title: yup.string().label(labels.title).trim().required(),
    description: yup.string().label(labels.description).required(),
  })

export const FormContent: FC<{ error?: ApolloError }> = ({ error }) => {
  const classes = useStyles()
  return (
    <Stack spacing={2} className={classes.root}>
      <TextFormField required autoFocus label={labels.title} name="title" />
      <EditorFormField required name="description" label={labels.description} />
      {error && <ApolloErrorList error={error} />}
    </Stack>
  )
}
const useStyles = makeStyles(() => ({
  root: {},
}))
