import { FC } from 'react'

import { ApolloError } from '@apollo/client'
import { Stack, CardContent, Grid, makeStyles, Theme } from '@material-ui/core'
import {
  TextAlignLeft,
  FileText,
  TextBolder,
  TextItalic,
  Calendar,
  LinkSimple,
  TextUnderline,
  XCircle,
  ListBullets,
} from 'phosphor-react'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { ANY } from '@kathena/types'
import { ApolloErrorList, TextFormField, FileItem, Button } from '@kathena/ui'

export type AttachmentEditorInput = {
  createdByAccountId: string
  title: string
  description: string
  dueDate: string
  attachments: FileItem | null
}

export const labels: Record<keyof AttachmentEditorInput, string> = {
  createdByAccountId: 'Tiêu đề',
  title: 'Tiêu đề',
  description: 'Mô tả',
  dueDate: 'Ngày tạo',
  attachments: 'Tệp tài liệu',
}

export const validationSchema: SchemaOf<AttachmentEditorInput> = yup.object({
  title: yup.string().label(labels.title).trim().required(),

  createdByAccountId: yup
    .string()
    .label(labels.createdByAccountId)
    .trim()
    .required(),

  description: yup.string().label(labels.description).trim().required(),

  dueDate: yup.string().label(labels.dueDate).trim().default(''),

  attachments: yup.mixed().label(labels.attachments).notRequired() as ANY,
})
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    alignItems: 'center',
    margin: 'auto',
  },
  icon: {
    textAlign: 'center',
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

export const FormContent: FC<{ error?: ApolloError }> = ({ error }) => {
  const classes = useStyles()
  return (
    <CardContent>
      <Stack spacing={2}>
        <Grid container className={classes.root}>
          <Grid item md={1} className={classes.icon}>
            <FileText size={30} />
          </Grid>
          <Grid item md={11}>
            <TextFormField
              required
              autoFocus
              label={labels.title}
              name="title"
            />
          </Grid>
        </Grid>
        <Grid container className={classes.root}>
          <Grid item md={1} className={classes.icon}>
            <TextAlignLeft size={30} />
          </Grid>
          <Grid item md={11}>
            <TextFormField
              label={labels.description}
              multiline
              name="description"
              minRows={3}
              maxRows={6}
            />
            <Grid container alignItems="center" className={classes.edit}>
              <Button>
                <TextBolder size={20} />
              </Button>
              <Button>
                <TextItalic size={20} />
              </Button>
              <Button>
                <TextUnderline size={20} />
              </Button>
              <Button>
                <ListBullets size={20} />
              </Button>
              <Button>
                <XCircle size={20} />
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid container className={classes.root}>
          <Grid item md={1} className={classes.icon}>
            <Calendar size={30} />
          </Grid>
          <Grid item md={4}>
            <TextFormField label={labels.dueDate} type="date" name="dueDate" />
          </Grid>
          <Grid item md={1} className={classes.icon}>
            <LinkSimple size={30} />
          </Grid>
          <Grid item md={5}>
            <TextFormField
              label={labels.attachments}
              type="file"
              name="attachments"
            />
          </Grid>
        </Grid>
        {error && <ApolloErrorList error={error} />}
      </Stack>
    </CardContent>
  )
}
