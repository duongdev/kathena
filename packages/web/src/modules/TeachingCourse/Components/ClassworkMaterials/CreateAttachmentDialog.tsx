/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, useCallback } from 'react'

import { makeStyles } from '@material-ui/core'

import { FormDialog } from '@kathena/ui'

import {
  FormContent,
  AttachmentEditorInput,
  validationSchema,
} from './AttachmentEditor.form'

export type CreateAttachmentDialogProps = {
  open: boolean
  onClose: () => void
}
const initialValues: AttachmentEditorInput = {
  name: '',
  address: '',
  phone: '',
}

const CreateAttachmentDialog: FC<CreateAttachmentDialogProps> = (props) => {
  const classes = useStyles(props)
  const { open, onClose } = props
  const handleCreateAttachment = useCallback(
    async (input: AttachmentEditorInput) => {
      console.log(input)
    },
    [],
  )
  return (
    <FormDialog
      open={open}
      onClose={onClose}
      initialValues={initialValues}
      validationSchema={validationSchema}
      submitButtonLabel="Thêm tài liệu"
      onSubmit={handleCreateAttachment}
      width={1000}
    >
      <FormContent />
    </FormDialog>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default CreateAttachmentDialog
