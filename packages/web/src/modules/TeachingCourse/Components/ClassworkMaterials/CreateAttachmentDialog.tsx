import { FC, useCallback } from 'react'

import { useSnackbar } from 'notistack'

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
  createdByAccountId: '',
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
      onClose()
      try {
        enqueueSnackbar(`Đã tạo văn phòng`, {
          variant: 'error',
        })
        onClose()
      } catch (err) {
        enqueueSnackbar(`Đã tạo văn phòng `, {
          variant: 'success',
        })
        onClose()
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
