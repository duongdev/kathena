import { FC, useCallback } from 'react'

import { CardContent, Grid, makeStyles, Stack } from '@material-ui/core'
import { useFormikContext } from 'formik'

import { DASHBOARD_SPACING } from '@kathena/theme'
import {
  UploadInput,
  SectionCard,
  Spinner,
  TextFormField,
  Typography,
  EditorFormField,
} from '@kathena/ui'

import {
  ClassworkAssignmentFormInput,
  classworkAssignmentLabels as labels,
} from './CreateClassworkAssignment'

export type CreateClassworkAssignmentFormProps = {}

const CreateClassworkAssignmentForm: FC<CreateClassworkAssignmentFormProps> = (
  props,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const classes = useStyles(props)
  const formik = useFormikContext<ClassworkAssignmentFormInput>()

  const handleAttachmentsSelect = useCallback(
    (files: File[]) => {
      formik.setFieldValue('attachments', files ?? null)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return (
    <Grid container spacing={DASHBOARD_SPACING}>
      <SectionCard
        maxContentHeight={false}
        gridItem={{ xs: 12, sm: 6 }}
        title="Thông tin bài tập"
      >
        <CardContent>
          <Stack spacing={2}>
            <TextFormField
              required
              autoFocus
              name="title"
              label={labels.title}
            />
            <EditorFormField required name="description" label="Mô Tả" />
            <TextFormField
              type="date"
              required
              name="dueDate"
              label={labels.dueDate}
            />
          </Stack>
        </CardContent>
      </SectionCard>
      <SectionCard
        maxContentHeight={false}
        gridItem={{ xs: 12, sm: 6 }}
        title={labels.attachments}
        classes={{ root: classes.attachmentsCard }}
        fullHeight={false}
      >
        {formik.isSubmitting && <Spinner container="overlay" />}
        <CardContent className={classes.attachmentsCardContent}>
          <UploadInput
            // accept={['image/png', 'image/jpeg']}
            onChange={handleAttachmentsSelect}
          />
          {formik.submitCount > 0 && formik.errors.attachments && (
            <Typography color="error" className={classes.attachmentsError}>
              {formik.errors.attachments}
            </Typography>
          )}
        </CardContent>
      </SectionCard>
    </Grid>
  )
}

const useStyles = makeStyles(({ spacing }) => ({
  root: {},
  attachmentsCard: {
    position: 'relative',
  },
  attachmentsCardContent: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '250px',
  },
  attachmentsError: {
    marginTop: spacing(2),
    flexShrink: 0,
    display: 'block',
  },
}))

export default CreateClassworkAssignmentForm
