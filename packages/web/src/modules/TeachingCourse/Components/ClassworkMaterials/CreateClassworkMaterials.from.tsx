/* eslint-disable @typescript-eslint/no-unused-vars */

import { FC, useCallback, useState } from 'react'

import {
  CardContent,
  Grid,
  IconButton,
  makeStyles,
  Stack,
} from '@material-ui/core'
import { useFormikContext } from 'formik'
import { Plus, X } from 'phosphor-react'

import { DASHBOARD_SPACING } from '@kathena/theme'
import {
  EditorFormField,
  SectionCard,
  Spinner,
  TextFormField,
  Typography,
  SelectFormField,
  InputField,
  useDialogState,
  UploadInput,
} from '@kathena/ui'
import InputFieldLabel from '@kathena/ui/InputField/InputFieldLabel'

import {
  ClassworkMaterialFormInput,
  classworkMaterialLabels as labels,
} from './CreateClassworkMaterials'
import kminLogo from './kmin-logo.png'

export type CreateClassworkMaterialFormProps = {
}

const CreateClassworkMaterialForm: FC<CreateClassworkMaterialFormProps> = (
  props,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const classes = useStyles(props)
  const formik = useFormikContext<ClassworkMaterialFormInput>()

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
        title="Thông tin tài liệu"
      >
        <CardContent>
          <Stack>
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
            onChange={handleMaterialSelect}
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
  iframeContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  iframeWrapper: {
    margin: '10px 10px 0px 0px',
    position: 'relative',
    cursor: 'pointer',
  },
  removeWrapper: {
    position: 'absolute',
    right: '-6px',
    top: '-6px',
    cursor: 'pointer',
    width: 18,
    height: 18,
    background: '#f2f2f2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
}))

export default CreateClassworkMaterialForm
