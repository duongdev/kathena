import { FC, useCallback } from 'react'

import { CardContent, makeStyles } from '@material-ui/core'
import { useFormikContext } from 'formik'

import { UploadInput, Spinner, Typography } from '@kathena/ui'

import { AddAttachmentsFormInput } from './AddAttachmentsToClassworkAssignment'

export type AddAttachmentsFormProps = {}

const AddAttachmentsForm: FC<AddAttachmentsFormProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const classes = useStyles(props)
  const formik = useFormikContext<AddAttachmentsFormInput>()

  const handleAttachmentsSelect = useCallback(
    (files: File[]) => {
      formik.setFieldValue('attachments', files ?? null)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return (
    <>
      {formik.isSubmitting && <Spinner container="overlay" />}
      <CardContent className={classes.attachmentsCardContent}>
        <UploadInput onChange={handleAttachmentsSelect} />
        {formik.submitCount > 0 && formik.errors.attachments && (
          <Typography color="error" className={classes.attachmentsError}>
            {formik.errors.attachments}
          </Typography>
        )}
      </CardContent>
    </>
  )
}

const useStyles = makeStyles(({ spacing }) => ({
  root: {},
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

export default AddAttachmentsForm
