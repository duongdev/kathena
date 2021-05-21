import { FC, useCallback } from 'react'

import { useSnackbar } from 'notistack'

import { FormDialog } from '@kathena/ui'

import {
  FormContent,
  AttachmentEditorInput,
  validationSchema,
} from './AttachmentEditor.form'
/* eslint-disable no-console */

export type CreateAttachmentDialogProps = {
  open: boolean
  onClose: () => void
}
const initialValues: AttachmentEditorInput = {
  // createdByAccountId: '',
  title: '',
  description: '',
  dueDate: '',
  attachments: null,
}

const CreateAttachmentDialog: FC<CreateAttachmentDialogProps> = (props) => {
  const { open, onClose } = props
  const { enqueueSnackbar } = useSnackbar()

  const handleCreateAttachment = useCallback(
    async (input: AttachmentEditorInput) => {
      try {
        console.log(input)

        enqueueSnackbar(`Đã tạo tài liệu`, {
          variant: 'success',
        })

        onClose()
      } catch (err) {
        console.log(err)
      }
    },
    [onClose, enqueueSnackbar],
  )
  return (
    <FormDialog
      open={open}
      onClose={onClose}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleCreateAttachment}
      submitButtonLabel="Thêm tài liệu"
      width={800}
    >
      <FormContent />
    </FormDialog>
  )
}
export default CreateAttachmentDialog
