import { FC, useCallback } from 'react'

import { CardContent, Grid, makeStyles, Stack } from '@material-ui/core'
import { useFormikContext } from 'formik'

import { DASHBOARD_SPACING } from '@kathena/theme'
import {
  EditorFormField,
  SectionCard,
  Spinner,
  Typography,
  UploadInput,
} from '@kathena/ui'

import {
  CreateSubmissionFormInput,
  CreateClassworkSubmissionLabels as labels,
} from './CreateSubmissionClassworkAssignment'

export type CreateSubmissionClassworkAssignmentFormProps = {}

const CreateSubmissionClassworkAssignmentForm: FC<CreateSubmissionClassworkAssignmentFormProps> =
  (props) => {
    const classes = useStyles(props)
    const formik = useFormikContext<CreateSubmissionFormInput>()

    const handleMaterialSelect = useCallback(
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
            <Stack mt={3}>
              <EditorFormField
                required
                name="description"
                label={labels.description}
              />
            </Stack>
          </CardContent>
        </SectionCard>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12, sm: 6 }}
          title={labels.submissionFiles}
          classes={{ root: classes.attachmentsCard }}
          fullHeight={false}
        >
          {formik.isSubmitting && <Spinner container="overlay" />}
          <CardContent className={classes.attachmentsCardContent}>
            <UploadInput
              // accept={['image/png', 'image/jpeg']}
              onChange={handleMaterialSelect}
            />
            {formik.submitCount > 0 && formik.errors.submissionFiles && (
              <Typography color="error" className={classes.attachmentsError}>
                {formik.errors.submissionFiles}
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

export default CreateSubmissionClassworkAssignmentForm
