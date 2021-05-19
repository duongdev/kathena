import { FC } from 'react'

import { ApolloError } from '@apollo/client'
import { Stack, CardContent, Grid, makeStyles, Theme } from '@material-ui/core'
import {
  TextAlignLeft,
  FileText,
  TextBolder,
  TextItalic,
  TextUnderline,
  XCircle,
  ListBullets,
} from 'phosphor-react'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { ApolloErrorList, TextFormField } from '@kathena/ui'
import { ORG_OFFICE_NAME_REGEX, PHONE_REGEX } from 'utils/validators'

export type AttachmentEditorInput = {
  name: string
  address: string
  phone: string
}

export const labels: Record<keyof AttachmentEditorInput, string> = {
  name: 'Tiêu đề',
  address: 'Mô tả(Không bắt buộc)',
  phone: 'Số điện thoại',
}

export const validationSchema: SchemaOf<AttachmentEditorInput> = yup.object({
  name: yup
    .string()
    .label(labels.name)
    .trim()
    .matches(ORG_OFFICE_NAME_REGEX, {
      message: `${labels.name} chứa các ký tự không phù hợp`,
    })
    .required(),
  address: yup.string().label(labels.address).trim().required(),
  phone: yup
    .string()
    .label(labels.phone)
    .trim()
    .matches(PHONE_REGEX, {
      message: `${labels.phone} không đúng định dạng`,
    })
    .required(),
})

export const FormContent: FC<{ error?: ApolloError }> = ({ error }) => {
  const classes = useStyles()
  return (
    <CardContent>
      <Stack spacing={2}>
        <Grid container className={classes.root}>
          <Grid item md={1}>
            <FileText size={30} />
          </Grid>
          <Grid item md={11}>
            <TextFormField required autoFocus label={labels.name} name="name" />
          </Grid>
        </Grid>
        <Grid container className={classes.root}>
          <Grid item md={1}>
            <TextAlignLeft size={30} />
          </Grid>
          <Grid item md={11}>
            <TextFormField
              label={labels.address}
              multiline
              name="address"
              minRows={3}
              maxRows={6}
            />
            <Grid container alignItems="center" className={classes.edit}>
              <TextBolder size={20} />
              <TextItalic size={20} />
              <TextUnderline size={20} />
              <ListBullets size={20} />
              <XCircle size={20} />
            </Grid>
          </Grid>
        </Grid>
        {error && <ApolloErrorList error={error} />}
      </Stack>
    </CardContent>
  )
}
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    alignItems: 'center',
    margin: 'auto',
  },
  edit: {
    width: 'fit-content',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.grey,
    color: theme.palette.text.secondary,
    '& svg': {
      margin: theme.spacing(1.5),
    },
    '& hr': {
      margin: theme.spacing(0, 0.5),
    },
  },
}))
