import { FC, useCallback } from 'react'

import { CardContent, Grid, makeStyles, Stack } from '@material-ui/core'
import { useFormikContext } from 'formik'

import { DASHBOARD_SPACING } from '@kathena/theme'
import {
  FileItem,
  ImagesUploadInput,
  SectionCard,
  TextFormField,
  Typography,
} from '@kathena/ui'

import {
  AcademicSubjectFormInput,
  academicSubjectLabels as labels,
} from './CreateUpdateAcademicSubject'

export type CreateUpdateAcademicSubjectFormProps = {}

const CreateUpdateAcademicSubjectForm: FC<CreateUpdateAcademicSubjectFormProps> = (
  props,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const classes = useStyles(props)
  const formik = useFormikContext<AcademicSubjectFormInput>()

  const handleImageSelect = useCallback(
    (files: FileItem[]) => {
      formik.setFieldValue('image', files[0] ?? null)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return (
    <Grid container spacing={DASHBOARD_SPACING}>
      <SectionCard
        maxContentHeight={false}
        gridItem={{ xs: 12, sm: 6 }}
        title="Thông tin môn học"
      >
        <CardContent>
          <Stack spacing={2}>
            <TextFormField required autoFocus name="name" label={labels.name} />
            <TextFormField
              required
              name="code"
              label={labels.code}
              placeholder="VD: JSBASIC"
            />
            <TextFormField
              required
              name="description"
              label={labels.description}
              multiline
              minRows={2}
              maxRows={4}
            />
          </Stack>
        </CardContent>
      </SectionCard>

      <SectionCard
        maxContentHeight={false}
        gridItem={{ xs: 12, sm: 6 }}
        title="Hình ảnh"
      >
        <CardContent className={classes.imageCardContent}>
          <ImagesUploadInput
            maxFiles={1}
            accept={['image/png', 'image/jpeg']}
            onChange={handleImageSelect}
          />
          {formik.dirty && formik.errors.image && (
            <Typography color="error" className={classes.imageError}>
              {formik.errors.image}
            </Typography>
          )}
        </CardContent>
      </SectionCard>
    </Grid>
  )
}

const useStyles = makeStyles(({ spacing }) => ({
  root: {},
  imageCardContent: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  imageError: {
    marginTop: spacing(2),
    flexShrink: 0,
    display: 'block',
  },
}))

export default CreateUpdateAcademicSubjectForm
