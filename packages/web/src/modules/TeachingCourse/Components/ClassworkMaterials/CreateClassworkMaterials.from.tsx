/* eslint-disable @typescript-eslint/no-unused-vars */

import { FC, useCallback } from 'react'

import { CardContent, Grid, makeStyles, Stack } from '@material-ui/core'
import { useFormikContext } from 'formik'

import { DASHBOARD_SPACING } from '@kathena/theme'
import {
  SectionCard,
  Spinner,
  TextFormField,
  Typography,
  SelectFormField,
  EditorFormField,
  UploadInput,
} from '@kathena/ui'

import {
  ClassworkMaterialFormInput,
  classworkMaterialLabels as labels,
} from './CreateClassworkMaterials'

export type CreateClassworkMaterialFormProps = {}

const CreateClassworkMaterialForm: FC<CreateClassworkMaterialFormProps> = (
  props,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const classes = useStyles(props)
  const formik = useFormikContext<ClassworkMaterialFormInput>()

  // const handleMaterialSelect = useCallback(
  //   (files: File[]) => {
  //     formik.setFieldValue('attachments', files ?? null)
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [],
  // )

  return (
    <Grid container spacing={DASHBOARD_SPACING}>
      <SectionCard
        maxContentHeight={false}
        gridItem={{ xs: 12, sm: 6 }}
        title="Thông tin bài tập"
      >
        <CardContent>
          <Stack >
            <TextFormField
              required
              autoFocus
              name="title"
              label={labels.title}
            />
          </Stack>
          <Stack mt={3}>
            <EditorFormField
              required
              name="description"
              label={labels.description}
            />
          </Stack>
          <Stack mt={3}>
            <SelectFormField
              gridItem={{ xs: 12 }}
              fullWidth
              required
              name="publicationState"
              label={labels.publicationState}
              placeholder="Chọn trạng thái"
              options={[
                { label: 'Published', value: 'Published' },
                { label: 'Draft', value: 'Draft' },
              ]}
            />
          </Stack>
        </CardContent>
      </SectionCard>
      {/* <SectionCard
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
            onChange={handleMaterialSelect}
          />
          {formik.submitCount > 0 && formik.errors.attachments && (
            <Typography color="error" className={classes.attachmentsError}>
              {formik.errors.attachments}
            </Typography>
          )}
        </CardContent>
      </SectionCard> */}
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

export default CreateClassworkMaterialForm
