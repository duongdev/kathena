import { FC, useCallback } from 'react'

import { makeStyles } from '@material-ui/core'
import { useFormikContext } from 'formik'

import { FileItem, ImagesUploadInput, Spinner, Typography } from '@kathena/ui'

export type UpdateImageAcademicSubjectFormInput = {
  newFile: FileItem | null
}

export type UpdateImageFormProps = {}

export const UpdateImageForm: FC<UpdateImageFormProps> = (props) => {
  const classes = useStyles(props)
  const formik = useFormikContext<UpdateImageAcademicSubjectFormInput>()

  const handleImageSelect = useCallback(
    (files: FileItem[]) => {
      formik.setFieldValue('newFile', files[0] ?? null)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  return (
    <>
      {formik.isSubmitting && <Spinner container="overlay" />}
      <ImagesUploadInput
        maxFiles={1}
        accept={['image/png', 'image/jpeg']}
        onChange={handleImageSelect}
      />
      {formik.submitCount > 0 && formik.errors.newFile && (
        <Typography color="error" className={classes.imageError}>
          {formik.errors.newFile}
        </Typography>
      )}
    </>
  )
}

const useStyles = makeStyles(({ spacing }) => ({
  root: {},
  imageError: {
    marginTop: spacing(2),
    flexShrink: 0,
    display: 'block',
  },
}))
